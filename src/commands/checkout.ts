import { loadConfig } from "../config";
import { recalculateCart } from "../services/cart";
import { getCheckoutDetail, getCheckoutWidgets, setTip } from "../services/checkout";
import { printTable, withSpinner, rappiOrangeBold, dim, bold, success, warn, hint } from "../ui";

const storeType = process.argv[2] || "restaurant";
const tipArg = process.argv[3];
const config = await loadConfig();

if (tipArg !== undefined) {
  const tip = parseInt(tipArg);
  await setTip(storeType, tip, config);
  console.log(tip > 0 ? `\n  ${success("\u2713")} Tip set to ${bold(`$${tip.toLocaleString("es-CO")}`)}` : `\n  ${success("\u2713")} Tip removed`);
}

const cart = await withSpinner("Preparing checkout...", () => recalculateCart(storeType, config));

if (!cart.stores?.length) {
  console.log("\n  Cart is empty. Add items first.\n");
  process.exit(0);
}

console.log(`\n  ${rappiOrangeBold("Checkout Preview")}\n`);

for (const store of cart.stores) {
  const status = store.is_open ? success("OPEN") : warn("CLOSED");
  const valid = store.valid ? "" : ` ${warn("INVALID")}`;

  printTable({
    title: `${store.name} [${store.id}] ${status}${valid}`,
    head: ["Product", "Qty", "Price", ""],
    rows: store.products.map((p: any) => {
      const price = p.total > 0
        ? `$${p.total.toLocaleString("es-CO")}`
        : `$${p.price.toLocaleString("es-CO")}`;
      const avail = p.available ? null : warn("not available");
      return [p.name, `x${p.units}`, price, avail];
    }),
  });

  if (store.charges?.length) {
    for (const c of store.charges) {
      if (c.total > 0) {
        console.log(`  ${dim(c.charge_type)}  $${c.total.toLocaleString("es-CO")}`);
      }
    }
  }
  console.log(`  ${dim("ETA")} ${store.eta_label}  ${dim("Store total")} ${bold(`$${store.total.toLocaleString("es-CO")}`)}\n`);
}

// Order summary
try {
  const detail = await withSpinner("Loading summary...", () => getCheckoutDetail(storeType, config));
  if (detail.summary?.length) {
    console.log(`  ${rappiOrangeBold("Order Summary")}\n`);
    for (const section of detail.summary) {
      if (section.header?.title) {
        console.log(`  ${bold(section.header.title)}`);
      }
      for (const d of section.details) {
        if (d.type === "separator") {
          console.log(`  ${dim("\u2500".repeat(40))}`);
        } else if (d.key && d.value) {
          const key = d.key.replace(/<[^>]*>/g, "");
          const val = d.value.replace(/<[^>]*>/g, "");
          console.log(`  ${dim(key.padEnd(30))} ${val}`);
        }
      }
    }
  }
} catch {}

// Checkout steps
try {
  const widgets = await getCheckoutWidgets(storeType, config);
  const types = widgets.map((w) => w.component_type);
  console.log(`\n  ${dim("Steps:")} ${types.join(` ${dim("\u2192")} `)}`);
} catch {}

console.log(`\n  ${dim("Place order:")} ${hint("rappi place-order")}\n`);
