import { saveConfig } from "../config";
import { getUser, isPrime } from "../services/auth";
import { getAddresses } from "../services/address";
import type { RappiConfig } from "../schemas/config";

const R = "\x1b[38;2;255;68;31m";
const G = "\x1b[32m";
const Y = "\x1b[33m";
const X = "\x1b[0m";

let chromium: typeof import("playwright").chromium;

try {
  ({ chromium } = await import("playwright"));
} catch {
  console.log(`\n${R}Playwright is not installed${X}\n`);
  console.log(`The ${Y}rappi login${X} command uses a browser to capture your auth token automatically.`);
  console.log(`To use it, install Playwright:\n`);
  console.log(`  ${G}bun add playwright${X}\n`);
  console.log(`Or skip browser login and set your token manually:\n`);
  console.log(`  ${G}rappi setup <bearer-token> [lat] [lng]${X}\n`);
  console.log(`To get your token:`);
  console.log(`  1. Open ${Y}https://www.rappi.com.co${X} in your browser`);
  console.log(`  2. Log in and open DevTools (F12) → Network tab`);
  console.log(`  3. Find any request to ${Y}services.grability.rappi.com${X}`);
  console.log(`  4. Copy the ${Y}Authorization${X} header value (starts with ${Y}ft.gAAAAA...${X})\n`);
  process.exit(1);
}

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

page.on("response", async (response) => {
  const url = response.url();
  if (url.includes("/ms/application-user/auth") && response.status() === 200) {
    const request = response.request();
    const authHeader = request.headers()["authorization"];
    const deviceHeader = request.headers()["deviceid"];

    if (authHeader?.startsWith("Bearer ft.")) {
      try {
        const body = await response.json();
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
