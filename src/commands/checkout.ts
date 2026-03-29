import { loadConfig } from "../config";
import { recalculateCart } from "../services/cart";
import { getCheckoutDetail, getCheckoutWidgets, setTip } from "../services/checkout";

const storeType = process.argv[2] || "restaurant";
const tipArg = process.argv[3];
const config = await loadConfig();

if (tipArg !== undefined) {
  const tip = parseInt(tipArg);
  await setTip(storeType, tip, config);
  console.log(tip > 0 ? `Tip set to $${tip.toLocaleString("es-CO")}` : "Tip removed.");
}

console.log("Preparing checkout...\n");

// 1. Recalculate cart
const cart = await recalculateCart(storeType, config);

if (!cart.stores?.length) {
  console.log("Cart is empty. Add items first with: bun run add-to-cart");
  process.exit(0);
}

for (const store of cart.stores) {
  const open = store.is_open ? "OPEN" : "CLOSED";
  const valid = store.valid ? "" : " (INVALID)";
  console.log(`  ${store.name} [${store.id}] — ${open}${valid}`);
  console.log(`  ETA: ${store.eta_label}`);

  for (const p of store.products) {
    const price =
      p.total > 0
        ? `$${p.total.toLocaleString("es-CO")}`
        : `$${p.price.toLocaleString("es-CO")}`;
    const avail = p.available ? "" : " (not available)";
    console.log(`    ${p.name} x${p.units} — ${price}${avail}`);
  }

  if (store.charges?.length) {
    for (const c of store.charges) {
      if (c.total > 0) {
        console.log(`    ${c.charge_type}: $${c.total.toLocaleString("es-CO")}`);
      }
    }
  }
  console.log(`  Store total: $${store.total.toLocaleString("es-CO")}`);
  console.log("");
}

// 2. Checkout detail (order summary)
try {
  const detail = await getCheckoutDetail(storeType, config);
  if (detail.summary?.length) {
    console.log("Order Summary:");
    for (const section of detail.summary) {
      if (section.header?.title) {
        console.log(`\n  ${section.header.title}`);
      }
      for (const d of section.details) {
        if (d.type === "separator") {
          console.log(`  ${"─".repeat(30)}`);
        } else if (d.key && d.value) {
          const key = d.key.replace(/<[^>]*>/g, "");
          const val = d.value.replace(/<[^>]*>/g, "");
          console.log(`  ${key.padEnd(30)} ${val}`);
        }
      }
    }
  }
} catch {
  // Checkout detail may fail if store is closed
}

// 3. Show checkout widgets (payment, address, etc.)
try {
  const widgets = await getCheckoutWidgets(storeType, config);
  const types = widgets.map((w) => w.component_type);
  console.log(`\nCheckout steps: ${types.join(" → ")}`);
} catch {
  // May fail
}

console.log(
  '\nTo place the order: bun run place-order [restaurant]'
);
