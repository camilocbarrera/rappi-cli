import { loadConfig } from "../config";
import { imageUrl } from "../formatters";
import { getRestaurantCatalog } from "../services/store";
import { printTable, withSpinner, rappiOrangeBold, dim, warn } from "../ui";

const limit = parseInt(process.argv[2] || "20");
const config = await loadConfig();
const catalog = await withSpinner("Loading restaurants...", () =>
  getRestaurantCatalog(config, { limit }),
);

if (!catalog.stores?.length) {
  console.log("\n  No restaurants available near you.\n");
  process.exit(0);
}

printTable({
  title: "Restaurants near you",
  head: ["ID", "Name", "ETA", "Shipping", "Rating", ""],
  rows: catalog.stores.map((s) => {
    const shipping = s.shipping_cost
      ? `$${s.shipping_cost.toLocaleString("es-CO")}`
      : "Free";
    const rating = s.score ? `${s.score}` : null;
    const status = !s.is_available ? warn("CLOSED") : null;
    return [String(s.store_id), s.name, s.eta, shipping, rating, status];
  }),
});

console.log(`\n  ${dim(`Showing ${catalog.stores.length} restaurants`)}\n`);
