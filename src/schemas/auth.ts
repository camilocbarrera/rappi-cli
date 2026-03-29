import { z } from "zod/v4";

export const RappiUserSchema = z
  .object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    country_code: z.string(),
    country_code_name: z.string(),
    vip: z.boolean(),
    loyalty: z.object({
      name: z.string(),
      description: z.string(),
      type: z.string(),
    }),
  })
  .passthrough();

export type RappiUser = z.infer<typeof RappiUserSchema>;
