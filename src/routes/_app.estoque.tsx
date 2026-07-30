import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Boxes, AlertTriangle, XCircle, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import type { Product } from "@/types";
import { Field } from "./_app.clientes";
import { brl, num } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/estoque")({
  head: () => ({ meta: [{ title: "Estoque — Sistema de Gestão" }] }),
  component: StockPage,
});

const schema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  codigo: z.string().min(1, "Informe o código"),
  categoria: z.string().min(1, "Informe a categoria"),
  fornecedorId: z.string().min(1, "Selecione um fornecedor"),
  valorCompra: z.coerce.number().min(0),
  valorVenda: z.coerce.number().min(0),
  estoque: z.coerce.number().min(0),
  estoqueMinimo: z.coerce.number().min(0),
  status: z.enum(["ativo", "inativo"]),
});
type Form = z.infer<typeof schema>;
const defaults: Form = { nome: "", codigo: "", categoria: "", fornecedorId: "", valorCompra: 0, valorVenda: 0, estoque: 0, estoqueMinimo: 0, status: "ativo" };


function statusOf(p: Product): { label: string; tone: "ok" | "low" | "out" } {
  if (p.estoque === 0) return { label: "Sem estoque", tone: "out" };
  if (p.estoque <= p.estoqueMinimo) return { label: "Estoque baixo", tone: "low" };
  return { label: "Disponível", tone: "ok" };
}

function StockPage() {
  const { products, suppliers, addProduct } = useData();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const openNew = () => { reset(defaults); setOpen(true); };
  const onSubmit = async (data: Form) => {
    await addProduct(data);
    toast.success("Produto cadastrado");
    setOpen(false);
  };


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
      <PageHeader
        title="Estoque"
        subtitle="Visão consolidada do estoque atual"
        actions={<Button onClick={openNew} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Novo Produto</Button>}
      />


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
