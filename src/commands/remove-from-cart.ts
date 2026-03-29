import { loadConfig } from "../config";
import { removeFromCart, getCarts } from "../services/cart";

const productId = process.argv[2];
const storeType = process.argv[3] || "restaurant";

if (!productId) {
  console.error(
    "Usage: rappi remove-from-cart <product_id> [store_type]"
  );
  console.error(
    '  product_id: compound ID from cart (e.g., "900006505_3522980")'
  );
  process.exit(1);
}

const config = await loadConfig();

// Show what we're removing
const carts = await getCarts(config);
let found = false;
for (const cart of carts) {
  for (const store of cart.stores) {
    const product = store.products.find((p) => p.id === productId);
    if (product) {
      console.log(`Removing: ${product.name} x${product.units} from ${store.name}`);
      found = true;
      break;
    }
  }
  if (found) break;
}

if (!found) {
  console.error(`Product "${productId}" not found in cart.`);
  console.error("Run `rappi cart` to see product IDs.");
  process.exit(1);
}

await removeFromCart(storeType, productId, config);
console.log("Removed from cart!");

// Show updated cart
const updated = await getCarts(config);
if (!updated.length || updated.every((c) => !c.stores.length)) {
  console.log("\nCart is now empty.");
} else {
  for (const cart of updated) {
    for (const store of cart.stores) {
      console.log(`\n  ${store.name} [${store.id}]`);
      for (const p of store.products) {
        const price =
          p.total > 0
            ? `$${p.total.toLocaleString("es-CO")}`
            : `$${p.price.toLocaleString("es-CO")}`;
        console.log(`    ${p.name} x${p.units} — ${price}`);
      }
      console.log(`  Total: $${store.total.toLocaleString("es-CO")}`);
    }
  }
}
