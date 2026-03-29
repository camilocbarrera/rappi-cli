import { loadConfig } from "../config";
import { recalculateCart } from "../services/cart";
import { placeOrder } from "../services/order";

const storeType = process.argv[2] || "restaurant";
const config = await loadConfig();

// Verify cart first
const cart = await recalculateCart(storeType, config);
if (!cart.stores?.length) {
  console.log("Cart is empty.");
  process.exit(1);
}

const invalidStores = cart.stores.filter((s: any) => !s.valid);
if (invalidStores.length) {
  console.error("Cannot place order — some stores are invalid:");
  for (const s of invalidStores) {
    const reason = s.is_open ? "products unavailable" : "store is closed";
    console.error(`  ${s.name}: ${reason}`);
  }
  process.exit(1);
}

console.log("Placing order...\n");
for (const store of cart.stores) {
  console.log(`  ${store.name}`);
  for (const p of store.products) {
    console.log(`    ${p.name} x${p.units} — $${p.total.toLocaleString("es-CO")}`);
  }
  console.log(`  Total: $${store.total.toLocaleString("es-CO")}`);
}

try {
  const result = await placeOrder(storeType, config);
  console.log("\nOrder placed!");
  console.log(JSON.stringify(result, null, 2));
} catch (err: any) {
  console.error(`\nFailed to place order: ${err.message}`);
  process.exit(1);
}
