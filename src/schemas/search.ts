import { z } from "zod/v4";

export const SearchProductSchema = z
  .object({
    name: z.string(),
    price: z.number(),
    product_id: z.number(),
    store_id: z.number(),
    image: z.string(),
    in_stock: z.boolean(),
    has_toppings: z.boolean(),
    discount: z.number(),
  })
  .passthrough();

export type SearchProduct = z.infer<typeof SearchProductSchema>;

export const SearchStoreSchema = z
  .object({
    store_id: z.number(),
    store_name: z.string(),
    store_type: z.string(),
    logo: z.string(),
    eta: z.string(),
    eta_value: z.number(),
    shipping_cost: z.number(),
    products: z.array(SearchProductSchema),
  })
  .passthrough();

export type SearchStore = z.infer<typeof SearchStoreSchema>;

export const SearchResultSchema = z
  .object({
    stores: z.array(SearchStoreSchema),
  })
  .passthrough();

export type SearchResult = z.infer<typeof SearchResultSchema>;
