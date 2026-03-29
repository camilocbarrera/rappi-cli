import { loadConfig } from "../config";
import { recalculateCart } from "../services/cart";
import { placeOrder } from "../services/order";
import { withSpinner, ok, fail, rappiOrangeBold, dim, bold, warn } from "../ui";

const storeType = process.argv[2] || "restaurant";
const config = await loadConfig();

const cart = await withSpinner("Validating cart...", () => recalculateCart(storeType, config));
if (!cart.stores?.length) {
  console.log(`\n${fail("Cart is empty.")}\n`);
  process.exit(1);
}

const invalidStores = cart.stores.filter((s: any) => !s.valid);
if (invalidStores.length) {
  console.log(`\n${fail("Cannot place order:")}`);
  for (const s of invalidStores) {
    const reason = s.is_open ? "products unavailable" : "store is closed";
    console.log(`    ${warn(s.name)}: ${reason}`);
  }
  console.log();
  process.exit(1);
}

console.log(`\n  ${rappiOrangeBold("Placing order")}\n`);
for (const store of cart.stores) {
  console.log(`  ${bold(store.name)}`);
  for (const p of store.products) {
    console.log(`    ${p.name} ${dim(`x${p.units}`)} -- $${p.total.toLocaleString("es-CO")}`);
  }
  console.log(`  ${dim("Total")} ${bold(`$${store.total.toLocaleString("es-CO")}`)}\n`);
}

try {
  const result = await withSpinner("Placing order...", () => placeOrder(storeType, config));
  console.log(`\n${ok("Order placed!")}`);
  console.log(`\n  ${dim(JSON.stringify(result, null, 2))}\n`);
} catch (err: any) {
  console.log(`\n${fail(`Failed to place order: ${err.message}`)}\n`);
  process.exit(1);
}
