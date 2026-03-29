import { loadConfig } from "../config";
import { getCarts } from "../services/cart";
import { printTable, withSpinner, rappiOrangeBold, dim, bold, warn } from "../ui";

const config = await loadConfig();
const carts = await withSpinner("Loading cart...", () => getCarts(config));

if (!carts.length) {
  console.log("\n  Your cart is empty.\n");
  process.exit(0);
}

for (const cart of carts) {
  console.log(`\n  ${rappiOrangeBold("Cart")} ${dim(`${cart.store_type} (${cart.id})`)}\n`);

  for (const store of cart.stores) {
    const status = store.is_open ? "" : ` ${warn("CLOSED")}`;

    printTable({
      title: `${store.name} [${store.id}]${status}`,
      head: ["Product", "Qty", "Price"],
      rows: store.products.map((p) => {
        const price = p.total > 0
          ? `$${p.total.toLocaleString("es-CO")}`
          : `$${p.price.toLocaleString("es-CO")}`;
        return [p.name, `x${p.units}`, price];
      }),
    });

    if (store.charges?.length) {
      for (const c of store.charges) {
        console.log(`  ${dim(c.charge_type)}  $${c.total.toLocaleString("es-CO")}`);
      }
    }
    console.log(`  ${dim("Store total")}  ${bold(`$${store.total.toLocaleString("es-CO")}`)}`);
    console.log();
  }

  console.log(`  ${dim("Products")}   $${cart.product_total.toLocaleString("es-CO")}`);
  console.log(`  ${dim("Shipping")}   $${cart.shipping_total.toLocaleString("es-CO")}`);
  console.log(`  ${bold("Sub-total")}  ${bold(`$${cart.sub_total.toLocaleString("es-CO")}`)}`);
  console.log();
}
