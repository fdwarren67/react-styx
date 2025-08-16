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

  static async search(
    model: SearchModel
  ): Promise<SearchResponse> {
    const res = await fetch(import.meta.env.VITE_API_BASE + "/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + DataService.idToken
      },
      body: JSON.stringify(model),
      credentials: "omit",
    });

    if (!res.ok) {
      let detail = "";
      try { detail = await res.text(); } catch { /* ignore */ }

      throw new Error(`${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    }

    return (await res.json()) as SearchResponse;
  }

  static async sql(
    model: SearchModel
  ): Promise<SqlResponse> {
    const res = await fetch(import.meta.env.VITE_API_BASE + "/sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + DataService.idToken
      },
      body: JSON.stringify(model),
      credentials: "omit",
    });

    if (!res.ok) {
      let detail = "";
      try { detail = await res.text(); } catch { /* ignore */ }

      throw new Error(`${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    }

    return (await res.json()) as SqlResponse;
  }

  static async entities(): Promise<EntitiesResponse> {
    // need to add include columns option
    const res = await fetch(import.meta.env.VITE_API_BASE + "/entities", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": "Bearer " + DataService.idToken
      },
      credentials: "omit",
    });

    if (!res.ok) {
      let detail = "";
      try { detail = await res.text(); } catch { /* ignore */ }

      throw new Error(`${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
    }

    return await res.json() as EntitiesResponse;
  }
}
