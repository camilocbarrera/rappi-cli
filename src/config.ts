import { existsSync } from "fs";
import { join } from "path";
import { RappiConfigSchema, type RappiConfig } from "./schemas/config";
import { CONFIG_FILENAME } from "./constants";

const CONFIG_PATH = join(import.meta.dir, "..", CONFIG_FILENAME);

export async function loadConfig(): Promise<RappiConfig> {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(
      `No config found. Run: bun run src/setup.ts <bearer-token> [lat] [lng]`
    );
  }
  const text = await Bun.file(CONFIG_PATH).text();
  const parsed = RappiConfigSchema.safeParse(JSON.parse(text));
  if (!parsed.success) {
    throw new Error(`Invalid config: ${parsed.error.message}`);
  }
  return parsed.data;
}

export async function saveConfig(config: RappiConfig): Promise<void> {
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
}
