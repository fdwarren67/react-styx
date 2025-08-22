// searchCamel.ts

/** Accepts either plain strings or server-provided column objects */
export type ColumnLike = string | { name?: string; label?: string; column?: string };

export interface SearchResult {
  columns: ColumnLike[];
  rows: unknown[][];
  // other fields (sql, params, etc.) may exist but aren't required here
}

/** Convert a string like 'well_id', 'WELL.ID', 'Well Name' -> 'wellId' */
export function toCamel(input: string): string {
  // treat any non-alphanumeric as a separator
  const cleaned = input.replace(/[^0-9A-Za-z]+/g, " ").trim();
  if (!cleaned) return "";
  const parts = cleaned.split(/\s+/);
  const head = parts[0].toLowerCase();
  const tail = parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
  return head + tail.join("");
}

/** Pull a name/label out of a column entry */
function asName(col: ColumnLike): string {
  if (typeof col === "string") return col;
  return String(col.name ?? col.label ?? col.column ?? "");
}

/**
 * Ensure keys are unique after camelizing.
 * Example: ['well_id','well-id'] -> ['wellId','wellId2']
 */
function dedupeKeys(keys: string[]): string[] {
  const used = new Set<string>();
  const counts: Record<string, number> = {};
  return keys.map((base) => {
    const b = base || "col";
    counts[b] = (counts[b] ?? 0) + 1;
    let candidate = counts[b] === 1 ? b : `${b}${counts[b]}`;
    while (used.has(candidate)) {
      counts[b] += 1;
      candidate = `${b}${counts[b]}`;
    }
    used.add(candidate);
    return candidate;
  });
}

/**
 * Transform (columns, rows) into an array of camelCase objects.
 * - Columns may be strings or objects with {name|label|column}.
 * - Handles duplicate/empty column names after camelization.
 */
export function rowsToCamelObjects<T extends object>(
  columns: ColumnLike[],
  rows: unknown[][]
): T[] {
  // ...existing logic...
  const width = columns.length;
  const keys = dedupeKeys(columns.map(c => {
    const name = toCamel(asName(c));
    return name || `col${Math.random().toString(36).slice(2, 6)}`; // fallback
  }));

  const data = rows.map(r => {
    const obj: Record<string, unknown> = {};
    const n = Math.min(width, r.length);
    for (let i = 0; i < n; i++) obj[keys[i]] = r[i];
    return obj;
  });

  return data as unknown as T[];
}

export function searchResultToCamelObjects<T extends object>(
  result: SearchResult
): T[] {
  return rowsToCamelObjects<T>(result.columns, result.rows);
}
