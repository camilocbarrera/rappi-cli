import { saveConfig } from "./config";
import { getUser, isPrime } from "./services/auth";
import { getAddresses } from "./services/address";
import type { RappiConfig } from "./schemas/config";
import { printDetail, withSpinner, ok, fail, dim, success, hint } from "./ui";

const token = process.argv[2];
if (!token) {
  console.error("Usage: rappi setup <bearer-token> [lat] [lng]");
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

const [user, prime] = await withSpinner("Verifying token...", () =>
  Promise.all([getUser(config), isPrime(config)]),
);

let addressLabel: string | undefined;
if (!latArg) {
  try {
    const { addresses } = await getAddresses(config);
    const active = addresses.find((a) => a.active);
    if (active) {
      config.lat = active.lat;
      config.lng = active.lng;
      addressLabel = `${active.tag || active.address} (${active.address})`;
    }
  } catch {}
}

printDetail(`Welcome, ${user.name}!`, [
  ["Email", user.email],
  ["Phone", `${user.country_code}${user.phone}`],
  ["Loyalty", `${user.loyalty.description} (${user.loyalty.type})`],
  ["Prime", prime ? success("Yes") : "No"],
  ["Address", addressLabel],
  ["Coords", `${config.lat}, ${config.lng}`],
]);

await saveConfig(config);
console.log(`${ok("Config saved! You can now use the CLI.")}\n`);

console.log(`  ${dim("What's next?")}\n`);
console.log(`  ${hint("rappi search <query>")}     Search for food`);
console.log(`  ${hint("rappi restaurants")}         Browse restaurants`);
console.log(`  ${hint("rappi addresses")}           Check delivery address\n`);
