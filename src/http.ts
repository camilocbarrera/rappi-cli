import type { RappiConfig } from "./schemas/config";
import { BASE_URL, DEFAULT_HEADERS } from "./constants";

function buildHeaders(config: RappiConfig): Record<string, string> {
  return {
    ...DEFAULT_HEADERS,
    authorization: `Bearer ${config.token}`,
    deviceid: config.deviceId,
  };
}

export async function get<T>(path: string, config: RappiConfig): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: buildHeaders(config),
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

export async function post<T>(
  path: string,
  body: unknown,
  config: RappiConfig
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { ...buildHeaders(config), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error(`POST ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

export async function put<T>(
  path: string,
  body: unknown,
  config: RappiConfig
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: { ...buildHeaders(config), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error(`PUT ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}
