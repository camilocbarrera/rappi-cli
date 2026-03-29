import { z } from "zod/v4";

export const OrderStoreSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    logo: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    type: z.string().optional(),
    store_type: z.string().optional(),
  })
  .passthrough();

export type OrderStore = z.infer<typeof OrderStoreSchema>;

export const ActiveOrderSchema = z
  .object({
    id: z.number(),
    total: z.number(),
    state: z.string(),
    place_at: z.string(),
    eta: z.string(),
    store: OrderStoreSchema,
    delivery_method: z.string(),
    tip: z.number(),
    can_be_cancel: z.boolean(),
  })
  .passthrough();

export type ActiveOrder = z.infer<typeof ActiveOrderSchema>;

export const CancelledOrderSchema = z
  .object({
    id: z.number(),
    state: z.string(),
    store: OrderStoreSchema,
  })
  .passthrough();

export type CancelledOrder = z.infer<typeof CancelledOrderSchema>;

export const OrdersResponseSchema = z
  .object({
    active_orders: z.array(ActiveOrderSchema),
    cancel_orders: z.array(CancelledOrderSchema),
  })
  .passthrough();

export type OrdersResponse = z.infer<typeof OrdersResponseSchema>;
