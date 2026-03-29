import { Hono } from "hono";
import { cors } from "hono/cors";
import { loadConfig } from "../config";
import { getUser, isPrime } from "../services/auth";
import { reverseGeocode, getAddresses, setActiveAddress } from "../services/address";
import { search } from "../services/search";
import { getStoreDetail, getRestaurantCatalog } from "../services/store";
import { getProductToppings } from "../services/product";
import { addToCart, getCarts, recalculateCart } from "../services/cart";
import { getCheckoutDetail, getCheckoutWidgets, setTip } from "../services/checkout";
import { placeOrder, getOrders } from "../services/order";
import { DEFAULT_STORE_TYPE } from "../constants";
import type { RappiConfig } from "../schemas/config";

type Variables = { config: RappiConfig };

const app = new Hono<{ Variables: Variables }>();

app.use("*", cors());

app.use("/api/*", async (c, next) => {
  const config = await loadConfig();
  c.set("config", config);
  await next();
});

// --- Auth ---

app.get("/api/whoami", async (c) => {
  const config = c.get("config");
  const [user, prime] = await Promise.all([getUser(config), isPrime(config)]);
  return c.json({ ...user, is_prime: prime });
});

// --- Search ---

app.get("/api/search", async (c) => {
  const q = c.req.query("q");
  if (!q) return c.json({ error: "Missing query parameter 'q'" }, 400);
  const config = c.get("config");
  return c.json(await search(q, config));
});

// --- Restaurants ---

app.get("/api/restaurants", async (c) => {
  const config = c.get("config");
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = parseInt(c.req.query("offset") || "0");
  return c.json(await getRestaurantCatalog(config, { limit, offset }));
});

// --- Store ---

app.get("/api/store/:id", async (c) => {
  const config = c.get("config");
  const id = parseInt(c.req.param("id"));
  if (!id) return c.json({ error: "Invalid store ID" }, 400);
  return c.json(await getStoreDetail(id, config));
});

// --- Product ---

app.get("/api/product/:storeId/:productId", async (c) => {
  const config = c.get("config");
  const storeId = parseInt(c.req.param("storeId"));
  const productId = parseInt(c.req.param("productId"));
  if (!storeId || !productId) return c.json({ error: "Invalid store or product ID" }, 400);
  return c.json(await getProductToppings(storeId, productId, config));
});

// --- Cart ---

app.post("/api/cart/add", async (c) => {
  const config = c.get("config");
  const body = await c.req.json<{
    storeId: number;
    productId: string;
    name: string;
    quantity?: number;
    toppings?: number[];
    price?: number;
  }>();

  if (!body.storeId || !body.productId || !body.name) {
    return c.json({ error: "Missing required fields: storeId, productId, name" }, 400);
  }

  const result = await addToCart(
    DEFAULT_STORE_TYPE,
    [
      {
        id: body.storeId,
        products: [
          {
            id: String(body.productId),
            name: body.name,
            toppings: body.toppings ?? [],
            units: body.quantity ?? 1,
            price: body.price ?? 0,
          },
        ],
      },
    ],
    config
  );
  return c.json(result);
});

app.get("/api/cart", async (c) => {
  const config = c.get("config");
  return c.json(await getCarts(config));
});

app.post("/api/cart/recalculate", async (c) => {
  const config = c.get("config");
  const storeType = c.req.query("storeType") || DEFAULT_STORE_TYPE;
  return c.json(await recalculateCart(storeType, config));
});

// --- Tip ---

app.post("/api/tip", async (c) => {
  const config = c.get("config");
  const body = await c.req.json<{ amount: number; storeType?: string }>();
  if (body.amount === undefined) {
    return c.json({ error: "Missing required field: amount" }, 400);
  }
  const storeType = body.storeType || DEFAULT_STORE_TYPE;
  await setTip(storeType, body.amount, config);
  return c.json({ ok: true, tip: body.amount });
});

// --- Checkout ---

app.get("/api/checkout", async (c) => {
  const config = c.get("config");
  const storeType = c.req.query("storeType") || DEFAULT_STORE_TYPE;
  const [cart, detail, widgets] = await Promise.allSettled([
    recalculateCart(storeType, config),
    getCheckoutDetail(storeType, config),
    getCheckoutWidgets(storeType, config),
  ]);
  return c.json({
    cart: cart.status === "fulfilled" ? cart.value : null,
    detail: detail.status === "fulfilled" ? detail.value : null,
    widgets: widgets.status === "fulfilled" ? widgets.value : null,
  });
});

// --- Order ---

app.post("/api/place-order", async (c) => {
  const config = c.get("config");
  const body = await c.req.json<{ storeType?: string }>().catch(() => ({}));
  const storeType = body.storeType || DEFAULT_STORE_TYPE;
  return c.json(await placeOrder(storeType, config));
});

app.get("/api/orders", async (c) => {
  const config = c.get("config");
  return c.json(await getOrders(config));
});

// --- Addresses ---

app.get("/api/addresses", async (c) => {
  const config = c.get("config");
  return c.json(await getAddresses(config));
});

app.post("/api/addresses/set", async (c) => {
  const config = c.get("config");
  const body = await c.req.json<{ addressId: number }>();
  if (!body.addressId) {
    return c.json({ error: "Missing required field: addressId" }, 400);
  }
  await setActiveAddress(body.addressId, config);
  return c.json({ ok: true, addressId: body.addressId });
});

export default app;
