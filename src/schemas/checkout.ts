import { z } from "zod/v4";

export const CheckoutDetailSchema = z
  .object({
    return_key: z.string(),
    summary: z.array(
      z.object({
        header: z.object({ title: z.string(), image: z.string() }),
        details: z.array(
          z.object({
            type: z.string(),
            key: z.string().nullable(),
            value: z.string().nullable(),
          })
        ),
      })
    ),
  })
  .passthrough();

export type CheckoutDetail = z.infer<typeof CheckoutDetailSchema>;

export const CheckoutWidgetSchema = z
  .object({
    component_type: z.string(),
    name: z.string(),
    configuration: z.record(z.string(), z.unknown()),
  })
  .passthrough();

export type CheckoutWidget = z.infer<typeof CheckoutWidgetSchema>;
