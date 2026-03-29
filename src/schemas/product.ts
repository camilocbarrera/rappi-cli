import { z } from "zod/v4";

export const ToppingSchema = z
  .object({
    id: z.number(),
    description: z.string(),
    price: z.number(),
    is_available: z.boolean(),
    image: z.string(),
  })
  .passthrough();

export type Topping = z.infer<typeof ToppingSchema>;

export const ToppingCategorySchema = z
  .object({
    id: z.number(),
    description: z.string(),
    topping_type_id: z.string(),
    min_toppings_for_categories: z.number(),
    max_toppings_for_categories: z.number(),
    toppings: z.array(ToppingSchema),
  })
  .passthrough();

export type ToppingCategory = z.infer<typeof ToppingCategorySchema>;

export const ProductToppingsSchema = z
  .object({
    categories: z.array(ToppingCategorySchema),
  })
  .passthrough();

export type ProductToppings = z.infer<typeof ProductToppingsSchema>;
