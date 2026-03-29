import { loadConfig } from "../config";
import { getStoreDetail } from "../services/store";

const storeId = parseInt(process.argv[2]);
if (!storeId) {
  console.error("Usage: bun run src/commands/store.ts <store_id>");
  process.exit(1);
}

const config = await loadConfig();
const store = await getStoreDetail(storeId, config);

console.log(`${store.name}`);
console.log(`${"─".repeat(store.name.length)}`);
console.log(`ID:       ${store.store_id}`);
console.log(`Address:  ${store.address}`);
console.log(`Type:     ${store.store_type?.description || store.store_type?.id}`);
console.log(`Status:   ${store.status?.status}`);
console.log(`Cooking:  ${store.min_cooking_time}-${store.max_cooking_time} min`);
console.log(`Brand:    ${store.brand?.name}`);

if (store.delivery_methods?.length) {
  console.log(`Delivery: ${store.delivery_methods.map((d: any) => d.type).join(", ")}`);
}

if (store.corridors?.length) {
  console.log(`\nMenu:`);
  for (const corridor of store.corridors) {
    console.log(`\n  ── ${corridor.name} ──`);
    if (corridor.products?.length) {
      for (const p of corridor.products) {
        const price = `$${p.price.toLocaleString("es-CO")}`;
        const stock = p.in_stock ? "" : " (OUT OF STOCK)";
        const toppings = p.has_toppings ? " [+options]" : "";
        console.log(`  [${p.id}] ${p.name} — ${price}${toppings}${stock}`);
        if (p.description) {
          console.log(`         ${p.description.slice(0, 80)}`);
        }
      }
    }
  }
}
