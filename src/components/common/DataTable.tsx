import type { ReactNode } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useDataTable, type SortDir } from "@/hooks/useDataTable";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  actions?: (row: T) => ReactNode;
  emptyMessage?: string;
  initialSort?: { key: keyof T; dir: SortDir };
}

export function DataTable<T>({
  data, columns, searchKeys, searchPlaceholder = "Pesquisar...", pageSize = 8, actions, emptyMessage = "Nenhum registro encontrado.", initialSort,
}: Props<T>) {
  const t = useDataTable<any>(data as any[], { searchKeys: searchKeys as any, pageSize, initialSort: initialSort as any });
  const rows = t.rows as T[];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={t.search}
            onChange={(e) => t.setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground">{t.total} registro(s)</span>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((c) => (
                <TableHead key={String(c.key)} className={cn(c.className)}>
                  {c.sortable ? (
                    <button
                      onClick={() => t.toggleSort(c.key as keyof T)}
                      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      {c.header}
                      <ArrowUpDown className={cn("h-3 w-3 opacity-50", t.sortKey === c.key && "opacity-100 text-primary")} />
                    </button>
                  ) : c.header}
                </TableHead>
              ))}
              {actions && <TableHead className="w-1 text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {t.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-10 text-muted-foreground text-sm">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              t.rows.map((row, i) => (
                <TableRow key={(row as any).id ?? i} className="hover:bg-muted/30">
                  {columns.map((c) => (
                    <TableCell key={String(c.key)} className={cn(c.className)}>
                      {c.render ? c.render(row) : String((row as any)[c.key] ?? "")}
                    </TableCell>
                  ))}
                  {actions && <TableCell className="text-right whitespace-nowrap">{actions(row)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Página {t.page} de {t.totalPages}
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={t.page <= 1} onClick={() => t.setPage(t.page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={t.page >= t.totalPages} onClick={() => t.setPage(t.page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
