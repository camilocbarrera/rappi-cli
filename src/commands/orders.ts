import { loadConfig } from "../config";
import { getOrders } from "../services/order";
import { printTable, withSpinner, rappiOrangeBold, dim, bold, warn } from "../ui";

const config = await loadConfig();
const data = await withSpinner("Loading orders...", () => getOrders(config));

if (data.active_orders?.length) {
  printTable({
    title: "Active Orders",
    head: ["ID", "Store", "Status", "ETA", "Total", "Delivery"],
    rows: data.active_orders.map((o: any) => {
      const store = o.store?.name ?? "Unknown";
      const state = o.state ?? "unknown";
      const eta = o.eta ? `${o.eta} min` : null;
      const total = o.total ? `$${o.total.toLocaleString("es-CO")}` : null;
      const delivery = o.delivery_method || null;
      return [String(o.id), store, state, eta, total, delivery];
    }),
  });
  console.log();
} else {
  console.log(`\n  ${dim("No active orders.")}\n`);
}

if (data.cancel_orders?.length) {
  printTable({
    title: "Cancelled Orders",
    head: ["ID", "Store", "Status"],
    rows: data.cancel_orders.map((o: any) => {
      const store = o.store?.name ?? "Unknown";
      const state = o.state ?? "cancelled";
      return [String(o.id), store, warn(state)];
    }),
  });
  console.log();
}
