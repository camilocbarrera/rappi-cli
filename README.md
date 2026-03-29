```
██████  ███████ ██████  ██████  ███████         ███████ ██      ███████
██   ██ ██   ██ ██   ██ ██   ██   ███           ██      ██        ███
██████  ███████ ██████  ██████    ███           ██      ██        ███
██  ██  ██   ██ ██      ██        ███           ██      ██        ███
██   ██ ██   ██ ██      ██      ███████         ███████ ███████ ███████
```

Order from [Rappi](https://www.rappi.com.co/) directly from the terminal or via REST API. Built with Bun, TypeScript, Zod, and Hono.

## Setup

```bash
bun install
bun link          # Makes `rappi` available globally
rappi login       # Opens browser — log in with your Rappi account
```

Or manually set your token:

```bash
rappi setup <bearer-token> [lat] [lng]
```

## CLI Usage

```bash
# Browse
rappi search "hamburguesa"              # Search products and stores
rappi restaurants 20                     # List nearby restaurants
rappi store 900006505                    # Store details and menu
rappi product 900006505 3522980          # Product options (toppings)

# Order
rappi add-to-cart 900006505 3522980 "McCombo" 1 "3525800"
rappi cart                               # View current cart
rappi tip 2000                           # Set delivery tip (COP)
rappi checkout                           # Preview order summary
rappi place-order                        # Place the order!
rappi orders                             # Track active orders

# Account
rappi whoami                             # User info + Prime status
rappi addresses                          # List saved addresses
rappi addresses set <id>                 # Set delivery address
```

## REST API

```bash
rappi server    # Starts on http://localhost:3100
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/whoami` | User info + Prime status |
| GET | `/api/search?q=pizza` | Search products and stores |
| GET | `/api/restaurants?limit=20` | Nearby restaurants |
| GET | `/api/store/:id` | Store detail + menu |
| GET | `/api/product/:storeId/:productId` | Product toppings |
| POST | `/api/cart/add` | Add to cart |
| GET | `/api/cart` | View cart |
| POST | `/api/cart/recalculate` | Recalculate totals |
| POST | `/api/tip` | Set tip |
| GET | `/api/checkout` | Checkout preview |
| POST | `/api/place-order` | Place order |
| GET | `/api/orders` | Track orders |
| GET | `/api/addresses` | List addresses |
| POST | `/api/addresses/set` | Set address |

## Architecture

```
src/
  constants.ts       → URLs, headers, defaults
  http.ts            → Typed HTTP helpers (get/post/put)
  config.ts          → Config load/save with Zod validation
  formatters.ts      → Price formatting (COP)
  schemas/           → Zod schemas (auth, address, search, store, product, cart, checkout, order)
  services/          → Business logic (shared by CLI + API)
  api/app.ts         → Hono REST API
  commands/          → CLI commands
index.ts             → CLI entry point
server.ts            → API server entry point
```

## Tech Stack

- [Bun](https://bun.sh) — Runtime
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Zod](https://zod.dev/) — Schema validation
- [Hono](https://hono.dev/) — REST API framework
- [Playwright](https://playwright.dev/) — Browser login automation
