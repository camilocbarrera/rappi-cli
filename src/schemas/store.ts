import { z } from "zod/v4";

export const CatalogStoreSchema = z
  .object({
    store_id: z.number(),
    name: z.string(),
    logo: z.string(),
    eta: z.string(),
    score: z.number(),
    shipping_cost: z.number(),
    is_available: z.boolean(),
  })
  .passthrough();

export type CatalogStore = z.infer<typeof CatalogStoreSchema>;

export const StoreCatalogSchema = z
  .object({
    filters: z.unknown(),
    stores: z.array(CatalogStoreSchema),
  })
  .passthrough();

export type StoreCatalog = z.infer<typeof StoreCatalogSchema>;

export const StoreProductSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    real_price: z.number(),
    image: z.string(),
    in_stock: z.boolean(),
    has_toppings: z.boolean(),
  })
  .passthrough();

export type StoreProduct = z.infer<typeof StoreProductSchema>;

export const StoreCorridorsSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    products: z.array(StoreProductSchema),
  })
  .passthrough();

export type StoreCorridors = z.infer<typeof StoreCorridorsSchema>;

export const StoreDetailSchema = z
  .object({
    store_id: z.number(),
    name: z.string(),
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    logo: z.string(),
    background: z.string(),
    store_type: z.object({ id: z.string(), description: z.string() }),
    status: z.object({ status: z.string() }),
    min_cooking_time: z.number(),
    max_cooking_time: z.number(),
    delivery_conditions: z.array(z.unknown()),
    delivery_methods: z.array(z.unknown()),
    brand: z.object({ id: z.number(), name: z.string() }),
    corridors: z.array(StoreCorridorsSchema).optional(),
  })
  .passthrough();

export type StoreDetail = z.infer<typeof StoreDetailSchema>;
