import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2, Eye } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useData } from "@/context/DataContext";
import type { PaymentMethod, Sale } from "@/types";
import { Field, Row } from "./_app.clientes";
import { brl, dateBR, paymentLabel } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/vendas")({
  head: () => ({ meta: [{ title: "Vendas — Sistema de Gestão" }] }),
  component: SalesPage,
});

const schema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  produtoId: z.string().min(1, "Selecione um produto"),
  quantidade: z.coerce.number().min(1, "Mínimo 1"),
  valorUnitario: z.coerce.number().min(0),
  desconto: z.coerce.number().min(0),
  formaPagamento: z.enum(["dinheiro", "pix", "cartao_credito", "cartao_debito", "boleto"]),
  data: z.string().min(1),
});
type Form = z.infer<typeof schema>;

function SalesPage() {
  const { sales, clients, products, addSale, updateSale, removeSale } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [viewing, setViewing] = useState<Sale | null>(null);
  const [toDelete, setToDelete] = useState<Sale | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const defaults: Form = { clienteId: "", produtoId: "", quantidade: 1, valorUnitario: 0, desconto: 0, formaPagamento: "pix", data: today };

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const wProd = watch("produtoId");
  const wQty = watch("quantidade");
  const wPrice = watch("valorUnitario");
  const wDesc = watch("desconto");

  useEffect(() => {
    const p = products.find((pp) => pp.id === wProd);
    if (p && !editing) setValue("valorUnitario", p.valorVenda);
  }, [wProd, products, editing, setValue]);

  const total = Math.max(0, Number(wQty || 0) * Number(wPrice || 0) - Number(wDesc || 0));

  const openNew = () => { setEditing(null); reset({ ...defaults, data: today }); setOpen(true); };
  const openEdit = (s: Sale) => { setEditing(s); reset({ ...s, data: s.data.slice(0, 10) }); setOpen(true); };

  const onSubmit = async (data: Form) => {
    const p = products.find((pp) => pp.id === data.produtoId);
    if (!p) return;
    if (!editing && p.estoque < data.quantidade) {
      toast.error("Estoque insuficiente");
      return;
    }
    const valorTotal = Math.max(0, data.quantidade * data.valorUnitario - (data.desconto || 0));
    const payload = {
      clienteId: data.clienteId,
      produtoId: data.produtoId,
      quantidade: data.quantidade,
      valorUnitario: data.valorUnitario,
      desconto: data.desconto || 0,
      valorTotal,
      formaPagamento: data.formaPagamento as PaymentMethod,
      data: new Date(data.data).toISOString(),
    };
    if (editing) { await updateSale(editing.id, payload); toast.success("Venda atualizada"); }
    else { await addSale(payload); toast.success("Venda registrada • Estoque atualizado"); }
    setOpen(false);
  };

  const clientName = (id: string) => clients.find((c) => c.id === id)?.nome ?? "—";
  const productName = (id: string) => products.find((p) => p.id === id)?.nome ?? "—";

  const columns: Column<Sale>[] = [
    { key: "data", header: "Data", sortable: true, render: (r) => dateBR(r.data) },
    { key: "clienteId", header: "Cliente", render: (r) => clientName(r.clienteId) },
    { key: "produtoId", header: "Produto", render: (r) => productName(r.produtoId) },
    { key: "quantidade", header: "Qtd", sortable: true },
    { key: "valorUnitario", header: "Unitário", render: (r) => brl(r.valorUnitario) },
    { key: "desconto", header: "Desconto", render: (r) => brl(r.desconto) },
    { key: "valorTotal", header: "Total", sortable: true, render: (r) => <span className="font-semibold">{brl(r.valorTotal)}</span> },
    { key: "formaPagamento", header: "Pagamento", render: (r) => paymentLabel[r.formaPagamento] },
  ];

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Registro e histórico de vendas — o estoque é atualizado automaticamente"
        actions={<Button onClick={openNew} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Nova Venda</Button>}
      />

      <DataTable<Sale>
        data={sales}
        columns={columns}
        searchKeys={[]}
        initialSort={{ key: "data", dir: "desc" }}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => setViewing(row)}><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Editar Venda" : "Nova Venda"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Cliente" error={errors.clienteId?.message}>
              <Controller control={control} name="clienteId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </Field>
            <Field label="Produto" error={errors.produtoId?.message}>
              <Controller control={control} name="produtoId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id} disabled={p.estoque === 0 && p.id !== editing?.produtoId}>
                        {p.nome} • estoque: {p.estoque}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </Field>
            <Field label="Quantidade" error={errors.quantidade?.message}><Input type="number" min={1} {...register("quantidade")} /></Field>
            <Field label="Valor Unitário" error={errors.valorUnitario?.message}><Input type="number" step="0.01" {...register("valorUnitario")} /></Field>
            <Field label="Desconto"><Input type="number" step="0.01" {...register("desconto")} /></Field>
            <Field label="Forma de Pagamento">
              <Controller control={control} name="formaPagamento" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange as (v: string) => void}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </Field>
            <Field label="Data" error={errors.data?.message}><Input type="date" {...register("data")} /></Field>
            <div className="sm:col-span-2 mt-2 rounded-xl border bg-muted/40 p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor Total</span>
              <span className="text-2xl font-semibold text-primary">{brl(total)}</span>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{editing ? "Salvar" : "Registrar Venda"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes da Venda</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <Row label="Data" value={dateBR(viewing.data)} />
              <Row label="Cliente" value={clientName(viewing.clienteId)} />
              <Row label="Produto" value={productName(viewing.produtoId)} />
              <Row label="Quantidade" value={viewing.quantidade} />
              <Row label="Valor Unitário" value={brl(viewing.valorUnitario)} />
              <Row label="Desconto" value={brl(viewing.desconto)} />
              <Row label="Total" value={brl(viewing.valorTotal)} />
              <Row label="Pagamento" value={paymentLabel[viewing.formaPagamento]} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Excluir venda?"
        description="A venda será removida e o estoque será restaurado."
        onConfirm={async () => { if (toDelete) { await removeSale(toDelete.id); toast.success("Venda removida"); setToDelete(null); } }}
      />
    </div>
  );
}
