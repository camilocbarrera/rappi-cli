import { loadConfig } from "../config";
import { getOrders } from "../services/order";

const config = await loadConfig();
const data = await getOrders(config);

if (data.active_orders?.length) {
  console.log("Active Orders:\n");
  for (const order of data.active_orders) {
    const storeName = order.store?.name ?? "Unknown store";
    const state = order.state ?? "unknown";
    console.log(`  [${order.id}] ${storeName} — ${state}`);
    if (order.eta) console.log(`    ETA: ${order.eta} min`);
    if (order.total) console.log(`    Total: $${order.total.toLocaleString("es-CO")}`);
    if (order.store?.address) console.log(`    Address: ${order.store.address}`);
    if (order.delivery_method) console.log(`    Delivery: ${order.delivery_method}`);
    if (order.place_at) console.log(`    Placed: ${order.place_at}`);
    console.log("");
  }
} else {
  console.log("No active orders.");
}

if (data.cancel_orders?.length) {
  console.log("\nCancelled Orders:\n");
  for (const order of data.cancel_orders) {
    const storeName = order.store?.name ?? "Unknown store";
    const state = order.state ?? "cancelled";
    console.log(`  [${order.id}] ${storeName} — ${state}`);
  }
}
