import { loadConfig } from "../config";
import { imageUrl } from "../formatters";
import { search } from "../services/search";
import { printTable, withSpinner, rappiOrangeBold, dim, bold, hint } from "../ui";

const query = process.argv[2];
if (!query) {
  console.error("Usage: rappi search <query>");
  process.exit(1);
}

const config = await loadConfig();
const result = await withSpinner(`Searching "${query}"...`, () => search(query, config));

if (!result.stores?.length) {
  console.log(`\n  No results for "${query}"\n`);
  process.exit(0);
}

console.log(`\n  ${rappiOrangeBold(`Results for "${query}"`)}\n`);

for (const store of result.stores) {
  const shipping = store.shipping_cost
    ? `$${store.shipping_cost.toLocaleString("es-CO")}`
    : "Free";

  console.log(`  ${bold(`[${store.store_id}]`)} ${store.store_name}`);
  console.log(`  ${dim("Type")} ${store.store_type}  ${dim("ETA")} ${store.eta}  ${dim("Shipping")} ${shipping}`);
  if (store.logo) console.log(`  ${dim("Logo")} ${hint(imageUrl(store.logo, "restaurants_logo"))}`);

  if (store.products?.length) {
    printTable({
      head: ["ID", "Product", "Price", ""],
      rows: store.products.slice(0, 3).map((p) => {
        const price = `$${p.price.toLocaleString("es-CO")}`;
        const flags = [
          p.discount > 0 ? `${dim(`-${p.discount}%`)}` : null,
          !p.in_stock ? dim("OUT OF STOCK") : null,
          p.has_toppings ? dim("[+options]") : null,
        ].filter(Boolean).join(" ");
        return [String(p.product_id), p.name, price, flags || null];
      }),
    });
    for (const p of store.products.slice(0, 3)) {
      if (p.image) console.log(`    ${dim(`${p.name}:`)} ${hint(imageUrl(p.image))}`);
    }
  }
  console.log();
}

console.log(`  ${dim(`${result.stores.length} stores found`)}\n`);
