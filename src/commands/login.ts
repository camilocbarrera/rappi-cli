import { chromium } from "playwright";
import { saveConfig } from "../config";
import { getUser, isPrime } from "../services/auth";
import { getAddresses } from "../services/address";
import type { RappiConfig } from "../schemas/config";

const R = "\x1b[38;2;255;68;31m";
const G = "\x1b[32m";
const X = "\x1b[0m";

console.log(`${R}Rappi CLI Login${X}`);
console.log("Opening browser — log in to your Rappi account...\n");

const browser = await chromium.launch({
  headless: false,
  args: ["--window-size=420,800"],
});

const context = await browser.newContext({
  viewport: { width: 420, height: 800 },
  userAgent:
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36",
});

const page = await context.newPage();

let capturedToken: string | null = null;
let capturedDeviceId: string | null = null;

// Intercept responses to the /ms/application-user/auth endpoint
// This only fires after a real login (not guest tokens)
page.on("response", async (response) => {
  const url = response.url();
  if (url.includes("/ms/application-user/auth") && response.status() === 200) {
    const request = response.request();
    const authHeader = request.headers()["authorization"];
    const deviceHeader = request.headers()["deviceid"];

    if (authHeader?.startsWith("Bearer ft.")) {
      try {
        const body = await response.json();
        // Only capture if it returns actual user data (not an error)
        if (body?.id && body?.email) {
          capturedToken = authHeader.replace("Bearer ", "");
          if (deviceHeader) capturedDeviceId = deviceHeader;
        }
      } catch {}
    }
  }
});

await page.goto("https://www.rappi.com.co/login");

console.log("Waiting for you to log in...");
console.log("(The browser will close automatically after login)\n");

// Wait for the authenticated token (max 5 minutes)
const timeout = 5 * 60 * 1000;
const start = Date.now();

while (!capturedToken && Date.now() - start < timeout) {
  await new Promise((r) => setTimeout(r, 2000));
}

await browser.close();

if (!capturedToken) {
  console.error("Login timed out. Please try again.");
  process.exit(1);
}

console.log(`${G}Token captured!${X} Verifying...`);

const config: RappiConfig = {
  token: capturedToken,
  deviceId: capturedDeviceId || crypto.randomUUID(),
  lat: parseFloat(process.argv[2] || "4.624335"),
  lng: parseFloat(process.argv[3] || "-74.063644"),
};

try {
  const user = await getUser(config);
  console.log(`\n  ${G}Welcome, ${user.name}!${X}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Phone: ${user.country_code}${user.phone}`);

  const prime = await isPrime(config);
  console.log(`  Prime: ${prime ? "Yes" : "No"}`);

  // Auto-sync with active delivery address
  try {
    const { addresses } = await getAddresses(config);
    const active = addresses.find((a) => a.active);
    if (active) {
      config.lat = active.lat;
      config.lng = active.lng;
      const label = active.tag || active.address;
      console.log(`  Address: ${label} (${active.address})`);
    }
  } catch {}

  console.log(`  Coords: ${config.lat}, ${config.lng}`);

  await saveConfig(config);
  console.log(`\n${G}Config saved! You can now use the CLI.${X}`);
} catch (err: any) {
  console.error(`\nToken verification failed: ${err.message}`);
  console.error("The token may have expired. Try logging in again.");
  process.exit(1);
}
