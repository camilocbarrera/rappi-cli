import { loadConfig } from "../config";
import { getUser, isPrime } from "../services/auth";
import { reverseGeocode } from "../services/address";

const config = await loadConfig();
const [user, prime, address] = await Promise.all([
  getUser(config),
  isPrime(config),
  reverseGeocode(config),
]);

console.log(`Name:     ${user.name}`);
console.log(`Email:    ${user.email}`);
console.log(`Phone:    ${user.country_code}${user.phone}`);
console.log(`Loyalty:  ${user.loyalty.description} (${user.loyalty.type})`);
console.log(`Prime:    ${prime ? "Yes" : "No"}`);
console.log(`Location: ${address.full_text_to_show || address.original_text}`);
console.log(`Coords:   ${config.lat}, ${config.lng}`);
