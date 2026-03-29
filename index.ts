#!/usr/bin/env bun
import { resolve, dirname } from "path";
import { readFileSync } from "fs";
import chalk from "chalk";

const ROOT = dirname(Bun.main);
const command = process.argv[2];

// --- Update check (non-blocking) ---
const pkgPath = resolve(ROOT, "package.json");
const currentVersion = JSON.parse(readFileSync(pkgPath, "utf-8")).version;

const skipUpdateCheck = !command || command === "mcp" || command === "server";
const updateCheck = skipUpdateCheck
  ? Promise.resolve()
  : fetch("https://registry.npmjs.org/rappi-cli/latest", {
      signal: AbortSignal.timeout(2000),
    })
      .then((r) => r.json())
      .then((data: any) => {
        if (data.version && data.version !== currentVersion) {
          const orange = chalk.hex("#FF441F");
          console.log(
            `\n  ${orange.bold("Update available:")} ${chalk.dim(currentVersion)} ${chalk.dim("\u2192")} ${orange(data.version)}`
          );
          console.log(`  Run ${chalk.cyan("npm install -g rappi-cli@latest")} to update\n`);
        }
      })
      .catch(() => {});

const commands: Record<string, string> = {
  setup: "src/setup.ts",
  whoami: "src/commands/whoami.ts",
  search: "src/commands/search.ts",
  restaurants: "src/commands/restaurants.ts",
  store: "src/commands/store.ts",
  product: "src/commands/product.ts",
  cart: "src/commands/cart.ts",
  "add-to-cart": "src/commands/add-to-cart.ts",
  "remove-from-cart": "src/commands/remove-from-cart.ts",
  checkout: "src/commands/checkout.ts",
  "place-order": "src/commands/place-order.ts",
  orders: "src/commands/orders.ts",
  login: "src/commands/login.ts",
  addresses: "src/commands/addresses.ts",
  tip: "src/commands/tip.ts",
  server: "../server.ts",
  mcp: "src/mcp/index.ts",
};

if (!command || command === "help" || !commands[command]) {
  const R = chalk.hex("#FF441F");
  const d = chalk.dim;
  const c = chalk.cyan;
  const b = chalk.bold;

  console.log(`
${R(`  ██████  ███████ ██████  ██████  ███████         ███████ ██      ███████
  ██   ██ ██   ██ ██   ██ ██   ██   ███           ██      ██        ███
  ██████  ███████ ██████  ██████    ███           ██      ██        ███
  ██  ██  ██   ██ ██      ██        ███           ██      ██        ███
  ██   ██ ██   ██ ██      ██      ███████         ███████ ███████ ███████`)}

  ${d(`v${currentVersion}  ·  Order from Rappi via the terminal`)}

${b("Browse")}
  ${c("search")} ${d("<query>")}               Search products and stores
  ${c("restaurants")} ${d("[limit]")}          List nearby restaurants
  ${c("store")} ${d("<store_id>")}             Show store details and menu
  ${c("product")} ${d("<store_id> <prod_id>")} Show product options (toppings)

${b("Order")}
  ${c("add-to-cart")} ${d("<store> <prod> [name] [qty] [toppings]")}  Add to cart
  ${c("remove-from-cart")} ${d("<product_id>")}  Remove from cart
  ${c("cart")}                         View current cart
  ${c("tip")} ${d("<amount>")}                 Set tip for delivery (COP)
  ${c("checkout")} ${d("[store_type] [tip]")}  Preview order summary
  ${c("place-order")} ${d("[store_type]")}     Place the order!
  ${c("orders")}                       Track active orders

${b("Account")}
  ${c("login")} ${d("[lat] [lng]")}            Log in via browser
  ${c("setup")} ${d("<token> [lat] [lng]")}    Manual token setup
  ${c("addresses")}                    List saved addresses
  ${c("addresses set")} ${d("<id>")}           Set delivery address
  ${c("whoami")}                       Show user info

${b("API")}
  ${c("server")}                       Start REST API server (port 3100)
  ${c("mcp")}                          Start MCP server (for Claude Code)

${d("Usage:")}  rappi <command> [args...]
`);
  process.exit(command && command !== "help" ? 1 : 0);
}

const args = process.argv.slice(3);
const proc = Bun.spawn(["bun", "run", resolve(ROOT, commands[command]), ...args], {
  stdio: ["inherit", "inherit", "inherit"],
});
const exitCode = await proc.exited;
await updateCheck;
process.exit(exitCode);
