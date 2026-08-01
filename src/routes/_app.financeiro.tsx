import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2, DollarSign, TrendingUp, TrendingDown, ShoppingBag, Target } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useData } from "@/context/DataContext";
import type { Expense } from "@/types";
import { Field } from "./_app.clientes";
import { brl, dateBR, num } from "@/lib/format";
import { runAction } from "@/lib/errors";

export const Route = createFileRoute("/_app/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Sistema de Gestão" }] }),
  component: FinancePage,
});

const schema = z.object({
  descricao: z.string().min(2),
  categoria: z.string().min(1),
  valor: z.coerce.number().min(0),
  data: z.string().min(1),
});
type Form = z.infer<typeof schema>;

function FinancePage() {
  const { expenses, sales, products, addExpense, updateExpense, removeExpense } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const defaults: Form = { descricao: "", categoria: "", valor: 0, data: today };

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: defaults,
  });

  const kpis = useMemo(() => {
    const receita = sales.reduce((s, x) => s + x.valorTotal, 0);
    const custoProdutos = sales.reduce((s, x) => {
      const p = products.find((pp) => pp.id === x.produtoId);
      return s + (p ? p.valorCompra * x.quantidade : 0);
    }, 0);
    const desp = expenses.reduce((s, x) => s + x.valor, 0);
    const lucro = receita - custoProdutos - desp;
    const ticket = sales.length ? receita / sales.length : 0;
    return { receita, desp, lucro, ticket, qtd: sales.length };
  }, [sales, expenses, products]);

  const openNew = () => { setEditing(null); reset({ ...defaults, data: today }); setOpen(true); };
  const openEdit = (e: Expense) => { setEditing(e); reset({ ...e, data: e.data.slice(0, 10) }); setOpen(true); };

  const onSubmit = async (data: Form) => {
    const payload = { ...data, data: new Date(data.data).toISOString() };
    const ok = editing
      ? await runAction(() => updateExpense(editing.id, payload), "Despesa atualizada")
      : await runAction(() => addExpense(payload), "Despesa cadastrada");
    if (ok) setOpen(false);
  };

  const columns: Column<Expense>[] = [
    { key: "data", header: "Data", sortable: true, render: (r) => dateBR(r.data) },
    { key: "descricao", header: "Descrição", sortable: true },
    { key: "categoria", header: "Categoria", sortable: true },
    { key: "valor", header: "Valor", sortable: true, render: (r) => <span className="font-semibold text-destructive">{brl(r.valor)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Controle de receitas, despesas e lucro"
        actions={<Button onClick={openNew} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Nova Despesa</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Receita" value={brl(kpis.receita)} icon={DollarSign} tone="primary" />
        <StatCard title="Despesas" value={brl(kpis.desp)} icon={TrendingDown} tone="danger" />
        <StatCard title="Lucro" value={brl(kpis.lucro)} icon={TrendingUp} tone={kpis.lucro >= 0 ? "success" : "danger"} />
        <StatCard title="Ticket Médio" value={brl(kpis.ticket)} icon={Target} tone="neutral" />
        <StatCard title="Qtd. Vendas" value={num(kpis.qtd)} icon={ShoppingBag} tone="neutral" />
      </div>

      <div className="mt-6">
        <DataTable<Expense>
          data={expenses}
          columns={columns}
          searchKeys={["descricao", "categoria"]}
          initialSort={{ key: "data", dir: "desc" }}
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          )}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Despesa" : "Nova Despesa"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Field label="Descrição" error={errors.descricao?.message}><Input {...register("descricao")} /></Field></div>
            <Field label="Categoria" error={errors.categoria?.message}><Input {...register("categoria")} /></Field>
            <Field label="Valor" error={errors.valor?.message}><Input type="number" step="0.01" {...register("valor")} /></Field>
            <Field label="Data" error={errors.data?.message}><Input type="date" {...register("data")} /></Field>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Excluir despesa?"
        onConfirm={async () => { if (toDelete && await runAction(() => removeExpense(toDelete.id), "Despesa removida")) setToDelete(null); }}
      />
    </div>
  );
}
