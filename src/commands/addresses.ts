import { loadConfig, saveConfig } from "../config";
import { getAddresses, setActiveAddress } from "../services/address";

const action = process.argv[2]; // "list" (default), "set"
const addressId = parseInt(process.argv[3]);

const config = await loadConfig();
const { addresses } = await getAddresses(config);

if (action === "set" && addressId) {
  const addr = addresses.find((a) => a.id === addressId);
  if (!addr) {
    console.error(`Address ${addressId} not found.`);
    process.exit(1);
  }

  try {
    await setActiveAddress(addressId, config);
  } catch {
    // Some APIs don't have this endpoint — update config lat/lng as fallback
  }

  // Update local config with the address coordinates
  config.lat = addr.lat;
  config.lng = addr.lng;
  await saveConfig(config);

  const active = addr.tag || addr.address;
  console.log(`Address set to: ${active}`);
  console.log(`  ${addr.address}`);
  console.log(`  ${addr.description || addr.subtitle}`);
  console.log(`  Coords: ${addr.lat}, ${addr.lng}`);
  process.exit(0);
}

// Default: list addresses
if (!addresses.length) {
  console.log("No saved addresses.");
  process.exit(0);
}

console.log("Your addresses:\n");
for (const addr of addresses) {
  const active = addr.active ? " (ACTIVE)" : "";
  const label = addr.tag || addr.address;
  const orders = addr.count_orders > 0 ? ` [${addr.count_orders} orders]` : "";
  console.log(`  [${addr.id}] ${label}${active}${orders}`);
  console.log(`    ${addr.address}`);
  if (addr.description) console.log(`    ${addr.description}`);
  if (addr.instructions) console.log(`    Instructions: ${addr.instructions}`);
  console.log(`    ${addr.city?.city || "?"} — ${addr.lat}, ${addr.lng}`);
  console.log("");
}

console.log('Set address: bun run addresses set <address_id>');
