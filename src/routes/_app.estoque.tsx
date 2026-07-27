import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Boxes, AlertTriangle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/context/DataContext";
import type { Product } from "@/types";
import { brl, num } from "@/lib/format";

export const Route = createFileRoute("/_app/estoque")({
  head: () => ({ meta: [{ title: "Estoque — Sistema de Gestão" }] }),
  component: StockPage,
});

function statusOf(p: Product): { label: string; tone: "ok" | "low" | "out" } {
  if (p.estoque === 0) return { label: "Sem estoque", tone: "out" };
  if (p.estoque <= p.estoqueMinimo) return { label: "Estoque baixo", tone: "low" };
  return { label: "Disponível", tone: "ok" };
}

function StockPage() {
  const { products, suppliers } = useData();

  const stats = useMemo(() => {
    const total = products.reduce((s, p) => s + p.estoque, 0);
    const baixo = products.filter((p) => p.estoque > 0 && p.estoque <= p.estoqueMinimo).length;
    const zero = products.filter((p) => p.estoque === 0).length;
    return { total, baixo, zero };
  }, [products]);

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.empresa ?? "—";

  const columns: Column<Product>[] = [
    { key: "codigo", header: "Código", sortable: true },
    { key: "nome", header: "Produto", sortable: true },
    { key: "categoria", header: "Categoria", sortable: true },
    { key: "fornecedorId", header: "Fornecedor", render: (r) => supplierName(r.fornecedorId) },
    { key: "estoque", header: "Estoque", sortable: true },
    { key: "estoqueMinimo", header: "Mínimo", sortable: true },
    { key: "valorVenda", header: "Preço", render: (r) => brl(r.valorVenda) },
    {
      key: "status", header: "Situação",
      render: (r) => {
        const s = statusOf(r);
        return (
          <Badge
            className={
              s.tone === "ok" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300"
              : s.tone === "low" ? "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300"
              : "bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300"
            }
          >{s.label}</Badge>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Estoque" subtitle="Visão consolidada do estoque atual" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total em Estoque" value={num(stats.total)} icon={Boxes} tone="primary" />
        <StatCard title="Estoque Baixo" value={num(stats.baixo)} icon={AlertTriangle} tone="warning" />
        <StatCard title="Sem Estoque" value={num(stats.zero)} icon={XCircle} tone="danger" />
      </div>

      <div className="mt-6">
        <DataTable<Product>
          data={products}
          columns={columns}
          searchKeys={["nome", "codigo", "categoria"]}
          initialSort={{ key: "estoque", dir: "asc" }}
        />
      </div>
    </div>
  );
}
