import { loadConfig } from "../config";
import { search } from "../services/search";

const query = process.argv[2];
if (!query) {
  console.error("Usage: bun run src/commands/search.ts <query>");
  process.exit(1);
}

const config = await loadConfig();
const result = await search(query, config);

if (!result.stores?.length) {
  console.log(`No results for "${query}"`);
  process.exit(0);
}

console.log(`Results for "${query}":\n`);

for (const store of result.stores) {
  const shipping = store.shipping_cost
    ? `$${store.shipping_cost.toLocaleString("es-CO")}`
    : "Free";
  console.log(`  [${store.store_id}] ${store.store_name}`);
  console.log(`    Type: ${store.store_type}  ETA: ${store.eta}  Shipping: ${shipping}`);

  if (store.products?.length) {
    for (const p of store.products.slice(0, 3)) {
      const price = `$${p.price.toLocaleString("es-CO")}`;
      const stock = p.in_stock ? "" : " (OUT OF STOCK)";
      const discount = p.discount > 0 ? ` -${p.discount}%` : "";
      console.log(`    • [${p.product_id}] ${p.name} — ${price}${discount}${stock}`);
    }
  }
  console.log("");
}

console.log(`Total: ${result.stores.length} stores found`);
