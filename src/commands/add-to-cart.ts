import { loadConfig } from "../config";
import { addToCart } from "../services/cart";
import { search } from "../services/search";

const storeId = parseInt(process.argv[2]);
const productId = process.argv[3];
const productName = process.argv[4] || "Product";
const quantity = parseInt(process.argv[5] || "1");
const toppingsArg = process.argv[6];

if (!storeId || !productId) {
  console.error(
    'Usage: bun run add-to-cart <store_id> <product_id> [name] [qty] [topping_ids]'
  );
  console.error('  topping_ids: comma-separated topping IDs (e.g., "1720411,1720415")');
  process.exit(1);
}

const toppings = toppingsArg
  ? toppingsArg.split(",").map((t) => parseInt(t.trim()))
  : [];

const config = await loadConfig();

// Look up product price from search
let price = 0;
const searchResult = await search(productName, config);
for (const store of searchResult.stores) {
  if (store.store_id === storeId) {
    const prod = store.products.find((p: any) => p.product_id === parseInt(productId));
    if (prod) {
      price = prod.price;
      break;
    }
  }
}

const result = await addToCart(
  "restaurant",
  [
    {
      id: storeId,
      products: [
        {
          id: productId,
          name: productName,
          toppings,
          units: quantity,
          price,
        },
      ],
    },
  ],
  config
);

console.log("Added to cart!\n");

for (const store of result.stores) {
  const open = store.is_open ? "" : " (CLOSED)";
  console.log(`  ${store.name} [${store.id}]${open}`);
  console.log(`  ETA: ${store.eta_label}`);

  for (const p of store.products) {
    const amt =
      p.total > 0 ? `$${p.total.toLocaleString("es-CO")}` : `$${p.price.toLocaleString("es-CO")}`;
    console.log(`    ${p.name} x${p.units} — ${amt}`);
  }

  console.log(`  Total: $${store.total.toLocaleString("es-CO")}`);
}
