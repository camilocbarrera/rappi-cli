import { loadConfig, saveConfig } from "../config";
import { getAddresses, setActiveAddress } from "../services/address";
import { printTable, printDetail, withSpinner, ok, fail, dim, bold, success, hint } from "../ui";

const action = process.argv[2];
const addressId = parseInt(process.argv[3]);

const config = await loadConfig();
const { addresses } = await withSpinner("Loading addresses...", () => getAddresses(config));

if (action === "set" && addressId) {
  const addr = addresses.find((a) => a.id === addressId);
  if (!addr) {
    console.log(`\n${fail(`Address ${addressId} not found.`)}\n`);
    process.exit(1);
  }

  try {
    await setActiveAddress(addressId, config);
  } catch {}

  config.lat = addr.lat;
  config.lng = addr.lng;
  await saveConfig(config);

  const active = addr.tag || addr.address;
  console.log(`\n${ok(`Address set to ${bold(active)}`)}`);
  printDetail("Address", [
    ["Street", addr.address],
    ["Detail", addr.description || addr.subtitle],
    ["Coords", `${addr.lat}, ${addr.lng}`],
  ]);
  process.exit(0);
}

if (!addresses.length) {
  console.log("\n  No saved addresses.\n");
  process.exit(0);
}

printTable({
  title: "Your addresses",
  head: ["ID", "Label", "Address", "City", "Orders", ""],
  rows: addresses.map((addr) => {
    const label = addr.tag || addr.address;
    const city = addr.city?.city || "--";
    const orders = addr.count_orders > 0 ? String(addr.count_orders) : null;
    const active = addr.active ? success("ACTIVE") : null;
    return [String(addr.id), label, addr.address, city, orders, active];
  }),
});

console.log(`\n  ${dim("Set address:")} ${hint("rappi addresses set <id>")}\n`);
