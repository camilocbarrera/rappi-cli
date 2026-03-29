import { loadConfig } from "../config";
import { imageUrl } from "../formatters";
import { getProductToppings } from "../services/product";
import { printTable, withSpinner, rappiOrangeBold, dim, warn } from "../ui";

const storeId = parseInt(process.argv[2]);
const productId = parseInt(process.argv[3]);
if (!storeId || !productId) {
  console.error("Usage: rappi product <store_id> <product_id>");
  process.exit(1);
}

const config = await loadConfig();
const data = await withSpinner("Loading options...", () =>
  getProductToppings(storeId, productId, config),
);

if (!data.categories?.length) {
  console.log("\n  No customization options for this product.\n");
  process.exit(0);
}

console.log(`\n  ${rappiOrangeBold(`Product options`)} ${dim(`(store ${storeId}, product ${productId})`)}\n`);

for (const cat of data.categories) {
  const required = cat.min_toppings_for_categories > 0 ? warn(" required") : "";
  const range =
    cat.min_toppings_for_categories === cat.max_toppings_for_categories
      ? `Pick ${cat.max_toppings_for_categories}`
      : `Pick ${cat.min_toppings_for_categories}-${cat.max_toppings_for_categories}`;

  printTable({
    title: `${cat.description}${required} ${dim(`[${range}]`)}`,
    head: ["ID", "Option", "Price", ""],
    rows: cat.toppings.map((t) => {
      const price = t.price > 0 ? `+$${t.price.toLocaleString("es-CO")}` : null;
      const status = !t.is_available ? dim("unavailable") : null;
      return [String(t.id), t.description, price, status];
    }),
  });
}
