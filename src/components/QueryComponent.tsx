/* eslint-disable @typescript-eslint/no-explicit-any */

import {forwardRef, useEffect, useMemo, useState} from "react";
import {MapModes} from "../geo-stuff/utils/Constants.tsx";
import './MapComponent.css'
import {
  DataService,
  emptyFilter,
  EntityListItem,
  FilterCollection,
  FilterExpression, isArrayOp,
  LogicalOperator,
  Operator,
  opsForType,
  SearchModel
} from "../common-stuff/DataService.tsx"

type FilterBuilderProps = {
  node: FilterCollection;
  onChange: (next: FilterCollection) => void;
  columns: { name: string; type: string }[];
  depth?: number;
};

const FilterBuilder: React.FC<FilterBuilderProps> = ({ node, onChange, columns, depth = 0 }) => {
  const colNames = columns.map(c => c.name);
  const getType = (name: string) => columns.find(c => c.name === name)?.type ?? "TEXT";

  function updateExpr(idx: number, patch: Partial<FilterExpression>) {
    const copy = structuredClone(node) as FilterCollection;
    copy.expressions[idx] = { ...copy.expressions[idx], ...patch };
    onChange(copy);
  }

  function addExpr() {
    const first = columns[0]?.name || "";
    const copy = structuredClone(node) as FilterCollection;
    copy.expressions.push({
      propertyName: first,
      operator: opsForType(getType(first))[0] ?? "EQ",
      value: "",
    });
    onChange(copy);
  }

  function removeExpr(i: number) {
    const copy = structuredClone(node) as FilterCollection;
    copy.expressions.splice(i, 1);
    onChange(copy);
  }

  function addGroup() {
    const copy = structuredClone(node) as FilterCollection;
    copy.collections.push(emptyFilter());
    onChange(copy);
  }

  function updateGroup(i: number, fc: FilterCollection) {
    const copy = structuredClone(node) as FilterCollection;
    copy.collections[i] = fc;
    onChange(copy);
  }

  function removeGroup(i: number) {
    const copy = structuredClone(node) as FilterCollection;
    copy.collections.splice(i, 1);
    onChange(copy);
  }

  function changeLogic(op: LogicalOperator) {
    onChange({ ...node, logicalOperator: op });
  }

  return (
    <div className="border rounded p-3 mb-3" style={{ background: depth % 2 ? "#fafafa" : "white" }}>
      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="fw-semibold">Group:</span>
        <select
          className="form-select form-select-sm"
          style={{ maxWidth: 160 }}
          value={node.logicalOperator}
          onChange={(e) => changeLogic(e.target.value as LogicalOperator)}
        >
          <option value="And">AND</option>
          <option value="Or">OR</option>
        </select>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addExpr}>
          + Expression
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addGroup}>
          + Group
        </button>
      </div>

      {/* Expressions */}
      {node.expressions.map((ex, i) => {
        const t = getType(ex.propertyName);
        const ops = opsForType(t);
        return (
          <div key={`expr-${i}`} className="row g-2 align-items-center mb-2">
            <div className="col-4">
              <select
                className="form-select form-select-sm"
                value={ex.propertyName}
                onChange={(e) => {
                  const col = e.target.value;
                  const nt = getType(col);
                  const allowed = opsForType(nt);
                  updateExpr(i, { propertyName: col, operator: allowed[0], value: "" });
                }}
              >
                {colNames.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-3">
              <select
                className="form-select form-select-sm"
                value={ex.operator}
                onChange={(e) => {
                  const op = e.target.value as Operator;
                  updateExpr(i, { operator: op, value: isArrayOp(op) ? [] : "" });
                }}
              >
                {ops.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            <div className="col">
              {isArrayOp(ex.operator) ? (
                <input
                  className="form-control form-control-sm"
                  placeholder="Comma-separated"
                  value={Array.isArray(ex.value) ? (ex.value as string[]).join(",") : ""}
                  onChange={(e) => {
                    const arr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                    updateExpr(i, { value: arr });
                  }}
                />
              ) : (
                <input
                  className="form-control form-control-sm"
                  placeholder="value"
                  value={typeof ex.value === "string" || typeof ex.value === "number" ? String(ex.value ?? "") : ""}
                  onChange={(e) => updateExpr(i, { value: e.target.value })}
                />
              )}
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeExpr(i)}>
                ✕
              </button>
            </div>
          </div>
        );
      })}

      {/* Child groups */}
      {node.collections.map((child, i) => (
        <div key={`group-${i}`} className="mb-2">
          <FilterBuilder
            node={child}
            onChange={(fc) => updateGroup(i, fc)}
            columns={columns}
            depth={depth + 1}
          />
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeGroup(i)}>
            Remove Group
          </button>
        </div>
      ))}
    </div>
  );
};

export interface QueryHandle {
  setCurrentMode: (mode: MapModes) => void;
}

const QueryComponent = forwardRef<QueryHandle>((props, ref) => {
  const [entities, setEntities] = useState<EntityListItem[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string>("");
  const selectedMeta = useMemo(
    () => entities.find(e => e.entity === selected),
    [entities, selected]
  );

  const [model, setModel] = useState<SearchModel>({
    entityName: "",
    columns: [],
    filter: emptyFilter(),
    sort: [],
    pageSize: 25,
    pageIndex: 0,
  });

  // Build/Execute results
  const [built, setBuilt] = useState<{ sql: string; params: never | any; countSql?: string; countParams?: any } | null>(null);
  const [execRows, setExecRows] = useState<never[][]>([]);
  const [execCols, setExecCols] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    doEntitiesLoad().then(r => {});
  }, [selected]);

  // When entity changes, reset model defaults
  useEffect(() => {
    if (!selected) return;
    setModel(m => ({
      ...m,
      entityName: selected,
      columns: [],        // empty means SELECT *
      filter: emptyFilter(),
      sort: [],
      pageSize: Math.min(25, selectedMeta?.maxPageSize ?? 1000),
      pageIndex: 0,
    }));
    setBuilt(null);
    setExecCols([]);
    setExecRows([]);
  }, [selected, selectedMeta?.maxPageSize]);

  const colsForEntity = selectedMeta?.columns ?? [];

  async function doEntitiesLoad() {
    try {
      setLoadingEntities(true);
      setError(null);

      const resp = await DataService.entities();

      setEntities(resp.entities);
      if (resp.entities.length && !selected) {
        setSelected(resp.entities[0].entity);
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoadingEntities(false);
    }
  }

  function updateFilter(fc: FilterCollection) {
    setModel(m => ({ ...m, filter: fc }));
  }

  function toggleColumn(name: string) {
    setModel(m => {
      const set = new Set(m.columns);
      if (set.has(name)) set.delete(name);
      else set.add(name);
      return { ...m, columns: Array.from(set) };
    });
  }

  function addSort() {
    // default: first column ASC
    const c = colsForEntity[0]?.name;
    if (!c) return;
    setModel(m => ({ ...m, sort: [...m.sort, c] }));
  }

  function updateSort(i: number, field: string, dir: "ASC" | "DESC") {
    setModel(m => {
      const next = [...m.sort];
      next[i] = dir === "DESC" ? `${field} DESC` : field;
      return { ...m, sort: next };
    });
  }

  function removeSort(i: number) {
    setModel(m => {
      const next = [...m.sort];
      next.splice(i, 1);
      return { ...m, sort: next };
    });
  }

  async function buildSQL() {
    setBusy(true); setError(null); setBuilt(null);
    try {
      const data = await DataService.sql(model);
      setBuilt({ sql: data.sql, params: data.params, countSql: data.countSql, countParams: data.countParams });
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function runQuery() {
    setBusy(true); setError(null); setExecCols([]); setExecRows([]); setBuilt(null);

    try {
      const data = await DataService.search(model);
      setExecCols(data.columns || []);
      setExecRows(data.rows || []);
      setBuilt({ sql: data.sql, params: data.params });
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container my-4">
      <h3 className="mb-3">Search Builder</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Entity picker */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Entity</label>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={loadingEntities}
          >
            {entities.map((e) => (
              <option key={e.entity} value={e.entity}>
                {e.entity} &nbsp;—&nbsp; {e.view}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={doEntitiesLoad}
          >
            Reload Entities
          </button>
        </div>
        {selectedMeta && (
          <div className="form-text">
            View: <code>{selectedMeta.view}</code> · cached: {String(selectedMeta.cached)} · maxPageSize: {selectedMeta.maxPageSize}
          </div>
        )}
      </div>

      {/* Columns selection */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Columns (leave empty for *)</label>
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-2">
          {colsForEntity.map((c) => (
            <div key={c.name} className="col">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`col-${c.name}`}
                  checked={model.columns.includes(c.name)}
                  onChange={() => toggleColumn(c.name)}
                />
                <label className="form-check-label" htmlFor={`col-${c.name}`}>
                  {c.name} <small className="text-muted">({c.type})</small>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sorts */}
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-between">
          <label className="form-label fw-semibold mb-0">Sort</label>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addSort}>
            + Add Sort
          </button>
        </div>
        {model.sort.length === 0 && <div className="form-text">No sorting (server default).</div>}
        {model.sort.map((s, i) => {
          const [fieldRaw, dirRaw] = s.split(/\s+/);
          const dir = (dirRaw?.toUpperCase() === "DESC" ? "DESC" : "ASC") as "ASC" | "DESC";
          const field = colsForEntity.find(c => c.name === fieldRaw)?.name ?? colsForEntity[0]?.name ?? "";
          return (
            <div key={i} className="row g-2 align-items-center mb-2">
              <div className="col-6 col-md-4">
                <select
                  className="form-select form-select-sm"
                  value={field}
                  onChange={(e) => updateSort(i, e.target.value, dir)}
                >
                  {colsForEntity.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-4 col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={dir}
                  onChange={(e) => updateSort(i, field, e.target.value as "ASC" | "DESC")}
                >
                  <option value="ASC">ASC</option>
                  <option value="DESC">DESC</option>
                </select>
              </div>
              <div className="col-auto">
                <button className="btn btn-sm btn-outline-danger" onClick={() => removeSort(i)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paging */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <label className="form-label fw-semibold">Page Size</label>
          <input
            type="number"
            className="form-control"
            min={1}
            max={selectedMeta?.maxPageSize ?? 1000}
            value={model.pageSize}
            onChange={(e) => setModel(m => ({ ...m, pageSize: Number(e.target.value) }))}
          />
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label fw-semibold">Page Index</label>
          <input
            type="number"
            className="form-control"
            min={0}
            value={model.pageIndex}
            onChange={(e) => setModel(m => ({ ...m, pageIndex: Number(e.target.value) }))}
          />
        </div>
      </div>

      {/* FilterBuilder */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Filters</label>
        <FilterBuilder node={model.filter} onChange={updateFilter} columns={colsForEntity} />
      </div>

      {/* Actions */}
      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-primary"
          onClick={buildSQL}
          disabled={busy || !model.entityName}
        >
          {busy ? "Working…" : "Build SQL"}
        </button>
        <button
          className="btn btn-primary"
          onClick={runQuery}
          disabled={busy || !model.entityName}
        >
          {busy ? "Running…" : "Run Query"}
        </button>
      </div>

      {/* Output: built SQL */}
      {built && (
        <div className="mt-4">
          <h5>SQL</h5>
          <pre className="bg-light p-3 rounded"><code>{built.sql}</code></pre>
          <h6>Params</h6>
          <pre className="bg-light p-3 rounded"><code>{JSON.stringify(built.params, null, 2)}</code></pre>
          {built.countSql && (
            <>
              <h6>Count SQL</h6>
              <pre className="bg-light p-3 rounded"><code>{built.countSql}</code></pre>
            </>
          )}
        </div>
      )}

      {/* Output: results table */}
      {execCols.length > 0 && (
        <div className="mt-4">
          <h5>Results</h5>
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover">
              <thead>
              <tr>
                {execCols.map((c, i) => <th key={i}>{c}</th>)}
              </tr>
              </thead>
              <tbody>
              {execRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell: any, cIdx: number) => (
                    <td key={cIdx}>{String(cell)}</td>
                  ))}
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

export default QueryComponent;
