import { loadConfig } from "../config";
import { getRestaurantCatalog } from "../services/store";

const limit = parseInt(process.argv[2] || "20");
const config = await loadConfig();
const catalog = await getRestaurantCatalog(config, { limit });

if (!catalog.stores?.length) {
  console.log("No restaurants available near you.");
  process.exit(0);
}

console.log(`Restaurants near you:\n`);

for (const store of catalog.stores) {
  const shipping = store.shipping_cost
    ? `$${store.shipping_cost.toLocaleString("es-CO")}`
    : "Free";
  const rating = store.score ? `★ ${store.score}` : "";
  const available = store.is_available ? "" : " (CLOSED)";
  console.log(`  [${store.store_id}] ${store.name}${available}`);
  console.log(`    ETA: ${store.eta}  Shipping: ${shipping}  ${rating}`);
  console.log("");
}

console.log(`Showing ${catalog.stores.length} restaurants`);
