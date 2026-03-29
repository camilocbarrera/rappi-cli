import { loadConfig } from "../config";
import { getCarts } from "../services/cart";

const config = await loadConfig();
const carts = await getCarts(config);

if (!carts.length) {
  console.log("Your cart is empty.");
  process.exit(0);
}

for (const cart of carts) {
  console.log(`Cart: ${cart.store_type} (${cart.id})`);
  console.log(`${"─".repeat(40)}`);

  for (const store of cart.stores) {
    const open = store.is_open ? "" : " (CLOSED)";
    console.log(`\n  ${store.name} [${store.id}]${open}`);
    console.log(`  ETA: ${store.eta_label}  Available: ${store.available}`);

    for (const p of store.products) {
      const price =
        p.total > 0 ? `$${p.total.toLocaleString("es-CO")}` : `$${p.price.toLocaleString("es-CO")}`;
      const avail = p.available ? "" : " (unavailable)";
      console.log(`    ${p.name} x${p.units} — ${price}${avail}`);
    }

    if (store.charges?.length) {
      console.log(`  Charges:`);
      for (const c of store.charges) {
        console.log(`    ${c.charge_type}: $${c.total.toLocaleString("es-CO")}`);
      }
    }

    console.log(`  Store total: $${store.total.toLocaleString("es-CO")}`);
  }

  console.log(`\n  Products:  $${cart.product_total.toLocaleString("es-CO")}`);
  console.log(`  Shipping:  $${cart.shipping_total.toLocaleString("es-CO")}`);
  console.log(`  Sub-total: $${cart.sub_total.toLocaleString("es-CO")}`);
  console.log("");
}
