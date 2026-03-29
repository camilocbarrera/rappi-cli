import { loadConfig } from "../config";
import { getProductToppings } from "../services/product";

const storeId = parseInt(process.argv[2]);
const productId = parseInt(process.argv[3]);
if (!storeId || !productId) {
  console.error("Usage: bun run src/commands/product.ts <store_id> <product_id>");
  process.exit(1);
}

const config = await loadConfig();
const data = await getProductToppings(storeId, productId, config);

if (!data.categories?.length) {
  console.log("No customization options for this product.");
  process.exit(0);
}

console.log(`Product options (store ${storeId}, product ${productId}):\n`);

for (const cat of data.categories) {
  const required = cat.min_toppings_for_categories > 0 ? " (required)" : "";
  const range =
    cat.min_toppings_for_categories === cat.max_toppings_for_categories
      ? `Pick ${cat.max_toppings_for_categories}`
      : `Pick ${cat.min_toppings_for_categories}-${cat.max_toppings_for_categories}`;
  console.log(`  ── ${cat.description}${required} [${range}] ──`);

  for (const t of cat.toppings) {
    const price = t.price > 0 ? ` +$${t.price.toLocaleString("es-CO")}` : "";
    const available = t.is_available ? "" : " (unavailable)";
    console.log(`    [${t.id}] ${t.description}${price}${available}`);
  }
  console.log("");
}
