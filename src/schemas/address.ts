import { z } from "zod/v4";

export const GeocodedAddressSchema = z
  .object({
    original_text: z.string(),
    full_text: z.string(),
    full_text_to_show: z.string(),
    matched: z.boolean(),
  })
  .passthrough();

export type GeocodedAddress = z.infer<typeof GeocodedAddressSchema>;

export const UserAddressSchema = z
  .object({
    id: z.number(),
    address: z.string(),
    active: z.boolean(),
    lat: z.number(),
    lng: z.number(),
    description: z.string(),
    tag: z.string(),
    city: z.object({ id: z.number(), city: z.string() }),
    count_orders: z.number(),
    instructions: z.string(),
    title: z.string(),
    subtitle: z.string(),
  })
  .passthrough();

export type UserAddress = z.infer<typeof UserAddressSchema>;
