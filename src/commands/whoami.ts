import { loadConfig } from "../config";
import { getUser, isPrime } from "../services/auth";
import { reverseGeocode } from "../services/address";
import { printDetail, withSpinner, success, dim } from "../ui";

const config = await loadConfig();
const [user, prime, address] = await withSpinner("Loading profile...", () =>
  Promise.all([getUser(config), isPrime(config), reverseGeocode(config)]),
);

function mask(value: string, visibleStart = 3, visibleEnd = 2): string {
  if (value.length <= visibleStart + visibleEnd) return value;
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : "";
  return value.slice(0, visibleStart) + "\u2022".repeat(value.length - visibleStart - visibleEnd) + end;
}

const [first, ...rest] = user.name.split(" ");
const maskedName = `${first} ${rest.map((n) => n[0] + "\u2022".repeat(n.length - 1)).join(" ")}`;
const maskedEmail = mask(user.email.split("@")[0]) + "@" + user.email.split("@")[1];
const maskedPhone = user.country_code + "\u2022".repeat(user.phone.length - 4) + user.phone.slice(-4);
const loc = address.full_text_to_show || address.original_text;

printDetail("Your Profile", [
  ["Name", maskedName],
  ["Email", maskedEmail],
  ["Phone", maskedPhone],
  ["Loyalty", `${user.loyalty.description} (${user.loyalty.type})`],
  ["Prime", prime ? success("Yes") : "No"],
  ["Location", mask(loc, Math.ceil(loc.length * 0.7), 0)],
  ["Coords", `${config.lat.toFixed(2)}\u2022\u2022, ${config.lng.toFixed(2)}\u2022\u2022`],
]);
