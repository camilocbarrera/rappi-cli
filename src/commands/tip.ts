import { loadConfig } from "../config";
import { setTip } from "../services/checkout";
import { withSpinner, ok, bold } from "../ui";

const tipArg = process.argv[2];
const storeType = process.argv[3] || "restaurant";

if (!tipArg) {
  console.error("Usage: rappi tip <amount> [store_type]");
  console.error("  amount: tip in COP (e.g., 2000) or 0 to remove tip");
  process.exit(1);
}

const tip = parseInt(tipArg);
const config = await loadConfig();
await withSpinner("Setting tip...", () => setTip(storeType, tip, config));

if (tip > 0) {
  console.log(`\n${ok(`Tip set to ${bold(`$${tip.toLocaleString("es-CO")}`)}`)}\n`);
} else {
  console.log(`\n${ok("Tip removed")}\n`);
}
