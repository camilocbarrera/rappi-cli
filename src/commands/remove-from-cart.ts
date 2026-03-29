import { loadConfig } from "../config";
import { removeFromCart, getCarts } from "../services/cart";
import { withSpinner, ok, fail, dim, bold } from "../ui";

const productId = process.argv[2];
const storeType = process.argv[3] || "restaurant";

if (!productId) {
  console.error("Usage: rappi remove-from-cart <product_id> [store_type]");
  console.error('  product_id: compound ID from cart (e.g., "900006505_3522980")');
  process.exit(1);
}

const config = await loadConfig();

const carts = await withSpinner("Loading cart...", () => getCarts(config));
let found = false;
for (const cart of carts) {
  for (const store of cart.stores) {
    const product = store.products.find((p) => p.id === productId);
    if (product) {
      console.log(`\n  ${dim("Removing")} ${bold(product.name)} ${dim(`x${product.units} from ${store.name}`)}`);
      found = true;
      break;
    }
  }
  if (found) break;
}

if (!found) {
  console.log(`\n${fail(`Product "${productId}" not found in cart.`)}`);
  console.log(`  ${dim("Run")} rappi cart ${dim("to see product IDs.")}\n`);
  process.exit(1);
}

await withSpinner("Removing...", () => removeFromCart(storeType, productId, config));
console.log(`${ok("Removed from cart")}\n`);

const updated = await getCarts(config);
if (!updated.length || updated.every((c) => !c.stores.length)) {
  console.log(`  ${dim("Cart is now empty.")}\n`);
} else {
  for (const cart of updated) {
    for (const store of cart.stores) {
      console.log(`  ${bold(store.name)} ${dim(`[${store.id}]`)}`);
      for (const p of store.products) {
        const price = p.total > 0
          ? `$${p.total.toLocaleString("es-CO")}`
          : `$${p.price.toLocaleString("es-CO")}`;
        console.log(`    ${p.name} ${dim(`x${p.units}`)} -- ${price}`);
      }
      console.log(`  ${dim("Total")} ${bold(`$${store.total.toLocaleString("es-CO")}`)}\n`);
    }
  }
}
