import type { RappiConfig } from "../schemas/config";
import type {
  CartStoreInput,
  CartResponse,
} from "../schemas/cart";
import { del, post, put } from "../http";

export async function addToCart(
  storeType: string,
  stores: CartStoreInput[],
  config: RappiConfig
): Promise<CartResponse> {
  const payload = stores.map((s) => ({
    id: s.id,
    place_at: s.place_at ?? "",
    delivery_method: s.delivery_method ?? "delivery",
    products: s.products.map((p) => ({
      id: p.id.includes("_") ? p.id : `${s.id}_${p.id}`,
      product_id: parseInt(p.id.includes("_") ? p.id.split("_")[1] : p.id),
      name: p.name,
      description: p.description || p.name,
      comment: p.comment ?? "",
      toppings: p.toppings.map((t) =>
        typeof t === "number"
          ? { id: t, description: "", units: 1, price: 0 }
          : { description: "", units: 1, price: 0, ...t }
      ),
      units: p.units,
      price: p.price ?? 0,
      real_price: p.real_price ?? p.price ?? 0,
      markup_price: p.price ?? 0,
      sale_type: p.sale_type || "U",
      sale_type_origin: p.sale_type_origin || "U",
      unit_type: p.unit_type || "U",
      category_id: p.category_id ?? 0,
      category_name: p.category_name ?? "",
      pum: p.pum ?? "0",
      is_sponsored: p.is_sponsored ?? false,
      ad_provider_metadata: p.ad_provider_metadata ?? "",
      in_stock: true,
    })),
  }));
  return put<CartResponse>(
    `/api/ms/shopping-cart/v2/${storeType}/store`,
    payload,
    config
  );
}

export async function getCarts(config: RappiConfig): Promise<CartResponse[]> {
  return post<CartResponse[]>(
    "/api/ms/shopping-cart/v1/all/get",
    {},
    config
  );
}

export async function removeFromCart(
  storeType: string,
  productId: string,
  config: RappiConfig
): Promise<unknown> {
  return del(
    `/api/ms/shopping-cart/v2/${storeType}/product/${productId}`,
    config
  );
}

export async function recalculateCart(
  storeType: string,
  config: RappiConfig
): Promise<CartResponse> {
  return post<CartResponse>(
    `/api/ms/shopping-cart/v1/${storeType}/recalculate`,
    {},
    config
  );
}
