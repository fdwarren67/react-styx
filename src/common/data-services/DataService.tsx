import {searchResultToCamelObjects} from "./SearchFunctions.tsx";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export type Operator =
  | "EQ" | "NE"
  | "LK" | "SW" | "EW"
  | "GT" | "GTE" | "LT" | "LTE"
  | "IN" | "NIN";

export type LogicalOperator = "And" | "Or";

export type FilterExpression = {
  propertyName: string;
  operator: Operator;
  value: string | string[] | number | boolean | null;
};

export type FilterCollection = {
  logicalOperator: LogicalOperator;
  expressions: FilterExpression[];
  collections: FilterCollection[];
};

export type SearchModel = {
  entityName: string;
  columns: string[];
  filter: FilterCollection;
  sort: string[];
  pageSize: number;
  pageIndex: number;
};

export type SearchResponse = {
  "columns": string[];
  "rows": any[];
  "sql": string;
  "params": any[];
  "pageSizeApplied": number;
  "mappedView": string;
}

export type EntityListItem = {
  entity: string;
  view: string;
  maxPageSize: number;
  cached: boolean;
  loadedAt?: string;
  columns?: { name: string; type: string }[];
};

export type EntitiesResponse = {
  entities: EntityListItem[];
};

export type SqlResponse = {
  "sql": string;
  "params": any[];
  "countSql": string;
  "countParams": any[];
  "pageSizeApplied": number;
  "maxPageSize": number;
  "mappedView": string;
}

export const emptyFilter = (): FilterCollection => ({
  logicalOperator: "And",
  expressions: [],
  collections: [],
});

export function opsForType(t: string): Operator[] {
  const T = t.toUpperCase();
  if (["TEXT"].includes(T)) return ["EQ","NE","LK","SW","EW","IN","NIN"];
  if (["NUMBER","DATE","TIMESTAMP","TIME"].includes(T)) return ["EQ","NE","GT","GTE","LT","LTE","IN","NIN"];
  if (["BOOLEAN"].includes(T)) return ["EQ","NE"];
  return ["EQ","NE"]; // OTHER
}

export function isArrayOp(op: Operator) {
  return op === "IN" || op === "NIN";
}

export class DataService {
  static idToken: string | null = null;

  /** How many seconds before exp we refresh proactively. */
  static refreshSkewSeconds = 120;

  static setIdToken(token: string | null) {
    DataService.idToken = token;
  }

  /** Decode a JWT and return exp (epoch seconds), or null. */
  private static getExp(token: string | null): number | null {
    if (!token) return null;
    try {
      const [, payloadB64] = token.split(".");
      if (!payloadB64) return null;
      const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(json);
      return typeof payload.exp === "number" ? payload.exp : null;
    } catch {
      return null;
    }
  }

  /** Refresh if the token is near expiry. No-op if we don't have one. */
  private static async maybeRefresh(): Promise<void> {
    const exp = DataService.getExp(DataService.idToken);
    if (!exp) return;

    const now = Math.floor(Date.now() / 1000);
    if (exp - now <= DataService.refreshSkewSeconds) {
      await DataService.refreshAccessToken();
    }
  }

  /** Exchange Google ID token -> our access token; sets cookie + idToken */
  static async exchangeGoogleIdToken(googleIdToken: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Send the raw Google ID token (JWT string)
      body: JSON.stringify({ id_token: googleIdToken }),
      // We want the refresh cookie set by the server
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Exchange failed: ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
    }

    const data = await res.json();
    DataService.setIdToken(data.access_token);
  }

  /** Calls /auth/refresh using the HttpOnly cookie; updates idToken */
  static async refreshAccessToken(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include", // send refresh cookie
    });
    if (!res.ok) return false;
    const data = await res.json();
    DataService.setIdToken(data.access_token);

    return true;
  }

  /** Logout: clears cookie on server and local token here. */
  static async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      DataService.setIdToken(null);
    }
  }

  private static async fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    await DataService.maybeRefresh();

    const headers = new Headers(init.headers || {});
    if (DataService.idToken) {
      headers.set("Authorization", `Bearer ${DataService.idToken}`);
    }

    const first = await fetch(input, { ...init, headers, credentials: init.credentials ?? "omit" });
    if (first.status !== 401) return first;

    // Try a single refresh -> retry once
    const refreshed = await DataService.refreshAccessToken();
    if (!refreshed) return first;

    const headers2 = new Headers(init.headers || {});
    if (DataService.idToken) {
      headers2.set("Authorization", `Bearer ${DataService.idToken}`);
    }
    return fetch(input, { ...init, headers: headers2, credentials: init.credentials ?? "omit" });
  }

  static async json<T extends object>(model: SearchModel): Promise<T[]> {
    return searchResultToCamelObjects<T>(await DataService.search(model));
  }

  static async tsx(model: SearchModel): Promise<string> {
    const res = await DataService.fetchWithAuth(`${API_BASE}/tsx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(model),
      credentials: "omit",
    });

    if (!res.ok) {
      let detail = "";
      try { detail = await res.text(); } catch { /* ignore */ }
      throw new Error(`${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    }

    return res.text() as Promise<string>;
  }

  static async search(model: SearchModel): Promise<SearchResponse> {
    const res = await DataService.fetchWithAuth(`${API_BASE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(model),
      credentials: "omit",
    });

    if (!res.ok) {
      let detail = "";
      try { detail = await res.text(); } catch { /* ignore */ }
      throw new Error(`${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    }

    return res.json() as Promise<SearchResponse>;
  }

  static async sql(model: SearchModel): Promise<SqlResponse> {
    // If app boot calls this before login, try cookie-based refresh once
    if (!DataService.idToken) {
      await DataService.refreshAccessToken().catch(() => {});
    }

    const res = await DataService.fetchWithAuth(`${API_BASE}/sql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(model),
      credentials: "omit",
    });

    if (!res.ok) {
      let detail = "";
      try { detail = await res.text(); } catch {}
      throw new Error(`${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    }
    return res.json() as Promise<SqlResponse>;
  }

  static async entities(): Promise<EntitiesResponse> {
    // Optional: if app boot calls this before login, try cookie-based refresh
    if (!DataService.idToken) {
      await DataService.refreshAccessToken().catch(() => {});
    }

    const res = await DataService.fetchWithAuth(`${API_BASE}/entities`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: "omit",
    });

    if (!res.ok) {
      let detail = "";
      try { detail = await res.text(); } catch {}
      throw new Error(`${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    }
    return res.json() as Promise<EntitiesResponse>;
  }
}
