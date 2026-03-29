import { z } from "zod/v4";

export const RappiConfigSchema = z.object({
  token: z.string(),
  deviceId: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export type RappiConfig = z.infer<typeof RappiConfigSchema>;
