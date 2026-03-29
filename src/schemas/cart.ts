import { z } from "zod/v4";

export const CartProductInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  comment: z.string().optional(),
  toppings: z.array(
    z.union([
      z.number(),
      z.object({
        id: z.number(),
        description: z.string().optional(),
        units: z.number().optional(),
        price: z.number().optional(),
      }),
    ])
  ),
  units: z.number(),
  price: z.number().optional(),
  real_price: z.number().optional(),
  sale_type: z.string().optional(),
  sale_type_origin: z.string().optional(),
  unit_type: z.string().optional(),
  category_id: z.number().optional(),
  category_name: z.string().optional(),
  pum: z.string().optional(),
  is_sponsored: z.boolean().optional(),
  ad_provider_metadata: z.string().optional(),
});

export type CartProductInput = z.infer<typeof CartProductInputSchema>;

export const CartStoreInputSchema = z.object({
  id: z.number(),
  delivery_method: z.string().optional(),
  place_at: z.string().optional(),
  products: z.array(CartProductInputSchema),
});

export type CartStoreInput = z.infer<typeof CartStoreInputSchema>;

export const CartProductResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    units: z.number(),
    price: z.number(),
    total: z.number(),
    available: z.boolean(),
    toppings: z.array(z.unknown()),
  })
  .passthrough();

export type CartProductResponse = z.infer<typeof CartProductResponseSchema>;

export const CartStoreResponseSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    available: z.boolean(),
    is_open: z.boolean(),
    eta_label: z.string(),
    charge_total: z.number(),
    product_total: z.number(),
    total: z.number(),
    valid: z.boolean(),
    products: z.array(CartProductResponseSchema),
    charges: z.array(
      z.object({
        charge_type: z.string(),
        total: z.number(),
      })
    ),
  })
  .passthrough();

export type CartStoreResponse = z.infer<typeof CartStoreResponseSchema>;

export const CartResponseSchema = z
  .object({
    id: z.string(),
    store_type: z.string(),
    stores: z.array(CartStoreResponseSchema),
    product_total: z.number(),
    shipping_total: z.number(),
    sub_total: z.number(),
  })
  .passthrough();

export type CartResponse = z.infer<typeof CartResponseSchema>;
