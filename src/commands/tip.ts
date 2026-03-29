import { loadConfig } from "../config";
import { setTip } from "../services/checkout";

const tipArg = process.argv[2];
const storeType = process.argv[3] || "restaurant";

if (!tipArg) {
  console.error("Usage: rappi tip <amount> [store_type]");
  console.error("  amount: tip in COP (e.g., 2000) or 0 to remove tip");
  console.error("  store_type: restaurant (default)");
  process.exit(1);
}

const tip = parseInt(tipArg);
const config = await loadConfig();
await setTip(storeType, tip, config);

if (tip > 0) {
  console.log(`Tip set to $${tip.toLocaleString("es-CO")}`);
} else {
  console.log("Tip removed.");
}
