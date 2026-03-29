import { saveConfig } from "./config";
import { getUser, isPrime } from "./services/auth";
import { getAddresses } from "./services/address";
import type { RappiConfig } from "./schemas/config";

const token = process.argv[2];
if (!token) {
  console.error("Usage: bun run src/setup.ts <bearer-token> [lat] [lng]");
  console.error("\nGet your token from browser DevTools → Network → copy the Authorization header value");
  process.exit(1);
}

const cleanToken = token.replace(/^Bearer\s+/i, "");
const latArg = process.argv[3];
const lngArg = process.argv[4];

const config: RappiConfig = {
  token: cleanToken,
  deviceId: crypto.randomUUID(),
  lat: latArg ? parseFloat(latArg) : 4.624335,
  lng: lngArg ? parseFloat(lngArg) : -74.063644,
};

console.log("Verifying token...");
const user = await getUser(config);
console.log(`\n  Welcome, ${user.name}!`);
console.log(`  Email: ${user.email}`);
console.log(`  Phone: ${user.country_code}${user.phone}`);
console.log(`  Loyalty: ${user.loyalty.description} (${user.loyalty.type})`);

const prime = await isPrime(config);
console.log(`  Prime: ${prime ? "Yes" : "No"}`);

// Auto-sync with active delivery address (unless lat/lng explicitly provided)
if (!latArg) {
  try {
    const { addresses } = await getAddresses(config);
    const active = addresses.find((a) => a.active);
    if (active) {
      config.lat = active.lat;
      config.lng = active.lng;
      const label = active.tag || active.address;
      console.log(`  Address: ${label} (${active.address})`);
    }
  } catch {
    // Addresses endpoint may fail — use default coords
  }
}

console.log(`  Coords: ${config.lat}, ${config.lng}`);

await saveConfig(config);
console.log("\nConfig saved! You can now use the CLI.");
