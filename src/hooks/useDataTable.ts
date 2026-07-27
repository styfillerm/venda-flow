import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export function useDataTable<T>(
  data: T[],
  opts: { searchKeys?: (keyof T)[]; pageSize?: number; initialSort?: { key: keyof T; dir: SortDir } } = {},
) {
  const { searchKeys = [], pageSize = 8, initialSort } = opts;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | undefined>(initialSort?.key);
  const [sortDir, setSortDir] = useState<SortDir>(initialSort?.dir ?? "asc");

  const filtered = useMemo(() => {
    let out = data;
    if (search && searchKeys.length) {
      const q = search.toLowerCase();
      out = out.filter((row) =>
        searchKeys.some((k) => String((row as any)[k] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sortKey) {
      out = [...out].sort((a, b) => {
        const av = (a as any)[sortKey];
        const bv = (b as any)[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number")
          return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return out;
  }, [data, search, searchKeys, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (k: keyof T) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  return {
    search, setSearch: (v: string) => { setSearch(v); setPage(1); },
    page: currentPage, setPage, totalPages,
    sortKey, sortDir, toggleSort,
    rows: paged, total: filtered.length,
  };
}
