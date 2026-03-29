import { loadConfig } from "../config";
import { imageUrl } from "../formatters";
import { getStoreDetail } from "../services/store";
import { printDetail, printTable, withSpinner, rappiOrangeBold, dim, bold, hint, success, warn } from "../ui";

const storeId = parseInt(process.argv[2]);
if (!storeId) {
  console.error("Usage: rappi store <store_id>");
  process.exit(1);
}

const config = await loadConfig();
const store = await withSpinner("Loading store...", () => getStoreDetail(storeId, config));

const status = store.status?.status === "open" ? success("OPEN") : warn("CLOSED");

printDetail(store.name, [
  ["ID", String(store.store_id)],
  ["Address", store.address],
  ["Type", store.store_type?.description || store.store_type?.id],
  ["Status", status],
  ["Cooking", `${store.min_cooking_time}-${store.max_cooking_time} min`],
  ["Brand", store.brand?.name],
  ["Logo", store.logo ? hint(imageUrl(store.logo, "restaurants_logo")) : null],
  ["Banner", store.background ? hint(imageUrl(store.background, "restaurants_background")) : null],
  ["Delivery", store.delivery_methods?.length ? store.delivery_methods.map((d: any) => d.type).join(", ") : null],
]);

if (store.corridors?.length) {
  console.log(`  ${rappiOrangeBold("Menu")}\n`);

  for (const corridor of store.corridors) {
    printTable({
      title: corridor.name,
      head: ["ID", "Product", "Price", ""],
      rows: corridor.products?.map((p: any) => {
        const price = `$${p.price.toLocaleString("es-CO")}`;
        const flags = [
          !p.in_stock ? dim("OUT OF STOCK") : null,
          p.has_toppings ? dim("[+options]") : null,
        ].filter(Boolean).join(" ");
        return [String(p.id), p.name, price, flags || null];
      }) || [],
    });
  }
}
