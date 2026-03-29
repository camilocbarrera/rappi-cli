export const BASE_URL = "https://services.grability.rappi.com";
export const DEFAULT_STORE_TYPE = "restaurant";
export const DEFAULT_COORDS = { lat: 4.624335, lng: -74.063644 } as const;
export const CONFIG_FILENAME = ".rappi-config.json";
export const API_PORT = 3100;

export const DEFAULT_HEADERS: Record<string, string> = {
  accept: "application/json",
  "accept-language": "es-CO",
  "app-version": "e1de6be43aa29091011474615d7ac0810051c36a",
  needappsflyerid: "false",
  origin: "https://www.rappi.com.co",
  referer: "https://www.rappi.com.co/",
  "user-agent":
    "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36",
  vendor: "rappi",
  "x-application-id":
    "rappi-microfront-web/e1de6be43aa29091011474615d7ac0810051c36a",
  "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
};
