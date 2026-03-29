# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## What is this

**Rappi CLI** — a command-line interface to order from [Rappi](https://www.rappi.com.co/) directly from the terminal and Claude Code. Uses Rappi's internal web API (`services.grability.rappi.com`) with a Bearer token obtained via browser login or DevTools.

This CLI is designed to be used **from Claude Code** as the primary interface for ordering food, groceries, and more from Rappi without leaving the terminal.

## Quick Start

```bash
bun install
bun run login           # Opens browser → log in → token auto-captured
bun run addresses       # List saved delivery addresses
bun run addresses set <id>  # Set delivery address
bun run search "crepe de pollo"  # Search for food
```

## All Commands

### Authentication

| Command | Description |
|---------|-------------|
| `bun run login [lat] [lng]` | Opens a Chromium browser at rappi.com.co/login. Log in with phone + WhatsApp OTP. Token is auto-captured and saved. Default location: Bogotá. |
| `bun run setup <token> [lat] [lng]` | Manual token setup — paste a Bearer token from browser DevTools. Use when `login` doesn't work. |
| `bun run whoami` | Shows authenticated user: name, email, phone, Prime status, current location. |

### Delivery Address

| Command | Description |
|---------|-------------|
| `bun run addresses` | Lists all saved delivery addresses with IDs, coordinates, and order counts. The `(ACTIVE)` address is the current delivery location. |
| `bun run addresses set <address_id>` | Sets the delivery address by ID. Updates local config with the address coordinates so searches and restaurants show results near that address. |

### Browse

| Command | Description |
|---------|-------------|
| `bun run search "<query>"` | Searches for products and stores. Returns store names, IDs, product names, prices, and delivery info. Use this to find what to order. |
| `bun run restaurants [limit]` | Lists nearby restaurants sorted by relevance. Default limit: 20. Shows store ID, name, ETA, shipping cost, and availability. |
| `bun run store <store_id>` | Shows store details: address, status (open/closed), cooking time, delivery methods, and full menu with product IDs and prices. |
| `bun run product <store_id> <product_id>` | Shows product customization options (toppings). Each topping category shows: required/optional, min/max picks, topping IDs with prices. |

### Order Flow

| Command | Description |
|---------|-------------|
| `bun run add-to-cart <store_id> <product_id> [name] [qty] [topping_ids]` | Adds a product to the shopping cart. `topping_ids` is a comma-separated list of topping IDs (e.g., `"1720411,1720415"`). |
| `bun run cart` | Shows current cart: stores, products, quantities, prices, shipping charges, and totals. |
| `bun run checkout [store_type]` | Previews the order: recalculates totals, shows checkout summary with all charges. Default store_type: `restaurant`. |
| `bun run place-order [store_type]` | Places the order! Validates cart first — fails if store is closed or products unavailable. |
| `bun run orders` | Shows active orders (with status and ETA) and cancelled orders. Use to track delivery. |

## Complete Order Example (Claude Code workflow)

Here's the full flow for ordering a "crepe de pollo" via Claude Code:

```bash
# 1. Search for the product
bun run search "crepe de pollo"
# Output: [900064851] Crepes & Waffle San Martin
#         [3167908] Pollo y Queso — $26,900 [+options]

# 2. Check product options/toppings
bun run product 900064851 3167908
# Output: ¿QUIERE CUBIERTOS? (required) [Pick 1]
#         [3168069] Si, quiero cubiertos
#         [3168070] No quiero cubiertos

# 3. Add to cart with selected toppings
bun run add-to-cart 900064851 3167908 "Pollo y Queso" 1 "3168069"

# 4. Review the cart
bun run cart

# 5. Preview checkout (see full price breakdown)
bun run checkout

# 6. Place the order
bun run place-order

# 7. Track the order
bun run orders
```

## Architecture

```
src/
  client.ts          → Typed Rappi API client (all HTTP calls)
  config.ts          → Load/save .rappi-config.json
  setup.ts           → Manual token setup
  commands/
    login.ts         → Browser-based login (Playwright)
    whoami.ts        → User profile
    addresses.ts     → List/set delivery addresses
    search.ts        → Unified search (products + stores)
    restaurants.ts   → Restaurant catalog listing
    store.ts         → Store detail + menu
    product.ts       → Product toppings/customization
    add-to-cart.ts   → Add product to shopping cart
    cart.ts          → View current cart contents
    checkout.ts      → Preview checkout summary
    place-order.ts   → Place the order
    orders.ts        → Track active/cancelled orders
```

## API Reference

Base URL: `https://services.grability.rappi.com`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ms/application-user/auth` | GET | Current user info |
| `/api/ms/rappi-prime/is-prime` | GET | Prime status |
| `/api/ms/address/reverse-geocode?lat=X&lng=Y` | GET | Geocode coordinates |
| `/api/ms/users-address/addresses` | GET | List saved addresses |
| `/api/pns-global-search-api/v1/unified-search` | POST | Search products/stores |
| `/api/restaurant-bus/stores/catalog-paged/home` | POST | Restaurant catalog |
| `/api/web-gateway/web/stores-router/id/{id}/` | GET | Store detail (trailing slash!) |
| `/api/web-gateway/web/restaurants-bus/products/toppings/{store}/{product}/` | GET | Product toppings |
| `/api/ms/shopping-cart/v2/{storeType}/store` | PUT | Add/update cart (body is array) |
| `/api/ms/shopping-cart/v1/all/get` | POST | Get all carts |
| `/api/ms/shopping-cart/v1/{storeType}/recalculate` | POST | Recalculate totals |
| `/api/ms/shopping-cart/v1/{storeType}/checkout/detail` | GET | Checkout summary |
| `/api/ms/checkout-component/{storeType}` | POST | Checkout widgets |
| `/api/ms/shopping-cart-proxy/{storeType}/checkout` | POST | Place order |
| `/api/ms/shopping-cart/v1/{storeType}/payment-method` | PUT | Set payment |
| `/api/user-order-home/orders` | GET | Active/cancelled orders |

## Agent Behavior

When using this CLI as an agent (e.g., from Claude Code), follow these rules:

- **Use emojis in all output.** Make the experience fun and visual. Use emojis for statuses (🛒 cart, 🔍 search, ✅ added, 📦 order, 🏍️ delivery, 💰 prices, 🍔 food, ⏱️ ETA, 📍 address, etc.).
- **Show the RAPPI CLI banner on first interaction.** When the Rappi CLI is invoked for the first time in a conversation, display this ASCII art banner in Rappi orange to greet the user:
  ```
  🟠 RAPPI CLI
  ██████  ███████ ██████  ██████  ███████         ███████ ██      ███████
  ██   ██ ██   ██ ██   ██ ██   ██   ███           ██      ██        ███
  ██████  ███████ ██████  ██████    ███           ██      ██        ███
  ██  ██  ██   ██ ██      ██        ███           ██      ██        ███
  ██   ██ ██   ██ ██      ██      ███████         ███████ ███████ ███████
  ```
- **Always confirm before placing an order.** Before running `bun run place-order`, show the user the full checkout summary (store, items, prices, total) and ask for explicit confirmation. Never place an order without the user saying "yes" or equivalent.
- **Always confirm before changing the delivery address.** Before running `bun run addresses set`, tell the user which address will be set and ask for confirmation.
- **Search before adding to cart.** The `add-to-cart` command looks up the product price via search. Always search first to verify the product is available and the price is correct.
- **Check required toppings.** Before adding a product to cart, run `bun run product <store_id> <product_id>` to check for required toppings (marked `required`). Ask the user which options they want if there are choices.
- **Show prices in human-readable format.** Format COP prices with dots as thousand separators (e.g., `$28.500`).

## Cart API Details

The Rappi cart API (`PUT /api/ms/shopping-cart/v2/{storeType}/store`) requires specific payload formatting:

- **Product ID**: Must be compound format `"storeId_productId"` (e.g., `"900006505_3522980"`), not just the product ID.
- **Toppings**: Must be objects `{ id, description, units, price }`, not flat numbers.
- **Price fields**: `price`, `real_price`, and `markup_price` must be included for the product to be priced correctly. Without these, the API accepts the item but sets price to $0.
- **sale_type**: Should be `"U"` for unit-based products (most restaurant items).
- The PUT response returns prices only when the above fields are sent correctly. The GET cart endpoint reflects whatever was stored.
- The `add-to-cart` command automatically looks up the product price via the search API before adding.

## Orders API Details

The orders endpoint (`GET /api/user-order-home/orders`) returns a nested structure:
- `active_orders[].store.name` — store name (not `store_name`)
- `active_orders[].state` — order state (not `status`). Values: `created`, `in_store`, `on_the_way`, `delivered`, etc.
- `active_orders[].eta` — estimated time in minutes
- `active_orders[].store.address` — store address
- `active_orders[].place_at` — timestamp when order was placed
- Products are **not** included in the order response — only store-level info.

## Important Notes

- **Token expiry**: Bearer tokens (`ft.gAAAAA...`) expire. Re-run `bun run login` when you get auth errors.
- **Store hours**: Most restaurants close late at night. Products show `$0` price when the store is closed.
- **Prices**: All prices are in COP (Colombian Pesos).
- **IDs in output**: Store IDs and product IDs are shown in brackets `[id]` — use these in subsequent commands.
- **Toppings**: Some products require toppings (marked `[+options]`). Use `bun run product` to see options, then pass topping IDs to `add-to-cart`.
- **storeType**: Default is `restaurant`. Other types exist for markets/pharmacies but aren't fully tested.
- **Config file**: `.rappi-config.json` stores token, deviceId, lat/lng. Gitignored.
