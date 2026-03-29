import { saveConfig } from "../config";
import { getUser, isPrime } from "../services/auth";
import { getAddresses } from "../services/address";
import type { RappiConfig } from "../schemas/config";
import { printDetail, ok, fail, rappiOrangeBold, dim, bold, success, warn, hint } from "../ui";

let chromium: typeof import("playwright").chromium;

try {
  ({ chromium } = await import("playwright"));
} catch {
  console.log(`\n${fail("Playwright is not installed")}\n`);
  console.log(`  The ${bold("rappi login")} command uses a browser to capture your auth token.`);
  console.log(`  To use it, install Playwright:\n`);
  console.log(`    ${hint("bun add playwright")}\n`);
  console.log(`  Or skip browser login and set your token manually:\n`);
  console.log(`    ${hint("rappi setup <bearer-token> [lat] [lng]")}\n`);
  console.log(`  ${dim("To get your token:")}`);
  console.log(`  ${dim("1.")} Open ${hint("https://www.rappi.com.co")} in your browser`);
  console.log(`  ${dim("2.")} Log in and open DevTools (F12) → Network tab`);
  console.log(`  ${dim("3.")} Find any request to ${hint("services.grability.rappi.com")}`);
  console.log(`  ${dim("4.")} Copy the Authorization header value ${dim("(starts with ft.gAAAAA...)")}\n`);
  process.exit(1);
}

console.log(`\n  ${rappiOrangeBold("Rappi CLI Login")}`);
console.log(`  ${dim("Opening browser — log in to your Rappi account...")}\n`);

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

console.log(`  ${dim("Waiting for you to log in...")}`);
console.log(`  ${dim("(The browser will close automatically after login)")}\n`);

const timeout = 5 * 60 * 1000;
const start = Date.now();

while (!capturedToken && Date.now() - start < timeout) {
  await new Promise((r) => setTimeout(r, 2000));
}

await browser.close();

if (!capturedToken) {
  console.log(`\n${fail("Login timed out. Please try again.")}\n`);
  process.exit(1);
}

console.log(`${ok("Token captured!")} ${dim("Verifying...")}`);

const config: RappiConfig = {
  token: capturedToken,
  deviceId: capturedDeviceId || crypto.randomUUID(),
  lat: parseFloat(process.argv[2] || "4.624335"),
  lng: parseFloat(process.argv[3] || "-74.063644"),
};

try {
  const user = await getUser(config);
  const prime = await isPrime(config);

  let addressLabel: string | undefined;
  try {
    const { addresses } = await getAddresses(config);
    const active = addresses.find((a) => a.active);
    if (active) {
      config.lat = active.lat;
      config.lng = active.lng;
      addressLabel = `${active.tag || active.address} (${active.address})`;
    }
  } catch {}

  printDetail(`Welcome, ${user.name}!`, [
    ["Email", user.email],
    ["Phone", `${user.country_code}${user.phone}`],
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
} catch (err: any) {
  console.log(`\n${fail(`Token verification failed: ${err.message}`)}`);
  console.log(`  ${dim("The token may have expired. Try logging in again.")}\n`);
  process.exit(1);
}
