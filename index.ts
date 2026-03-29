#!/usr/bin/env bun
import { resolve, dirname } from "path";

const ROOT = dirname(Bun.main);
const command = process.argv[2];

const commands: Record<string, string> = {
  setup: "src/setup.ts",
  whoami: "src/commands/whoami.ts",
  search: "src/commands/search.ts",
  restaurants: "src/commands/restaurants.ts",
  store: "src/commands/store.ts",
  product: "src/commands/product.ts",
  cart: "src/commands/cart.ts",
  "add-to-cart": "src/commands/add-to-cart.ts",
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
  const R = "\x1b[38;2;255;68;31m"; // #FF441F
  const X = "\x1b[0m";
  console.log(`
${R}  ██████  ███████ ██████  ██████  ███████         ███████ ██      ███████
  ██   ██ ██   ██ ██   ██ ██   ██   ███           ██      ██        ███
  ██████  ███████ ██████  ██████    ███           ██      ██        ███
  ██  ██  ██   ██ ██      ██        ███           ██      ██        ███
  ██   ██ ██   ██ ██      ██      ███████         ███████ ███████ ███████${X}

  Order from Rappi via the terminal

Browse:
  search <query>               Search products and stores
  restaurants [limit]          List nearby restaurants
  store <store_id>             Show store details and menu
  product <store_id> <prod_id> Show product options (toppings)

Order:
  add-to-cart <store> <prod> [name] [qty] [toppings]  Add product to cart
  cart                         View current cart
  tip <amount>                 Set tip for the delivery (COP)
  checkout [store_type] [tip]  Preview order summary (optional tip)
  place-order [store_type]     Place the order!
  orders                       Track active orders

Account:
  login [lat] [lng]            Log in via browser (auto-captures token)
  setup <token> [lat] [lng]    Manual token setup
  addresses                    List saved addresses
  addresses set <id>           Set delivery address
  whoami                       Show user info

API:
  server                       Start REST API server (port 3100)
  mcp                          Start MCP server (for Claude Code)

Usage:
  rappi <command> [args...]
`);
  process.exit(command && command !== "help" ? 1 : 0);
}

const args = process.argv.slice(3);
const proc = Bun.spawn(["bun", "run", resolve(ROOT, commands[command]), ...args], {
  stdio: ["inherit", "inherit", "inherit"],
});
const exitCode = await proc.exited;
process.exit(exitCode);
