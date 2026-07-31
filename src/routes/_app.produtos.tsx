import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2, Eye } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useData } from "@/context/DataContext";
import type { Product } from "@/types";
import { Field, Row } from "./_app.clientes";
import { brl } from "@/lib/format";
import { toast } from "sonner";
import { Controller } from "react-hook-form";

export const Route = createFileRoute("/_app/produtos")({
  head: () => ({ meta: [{ title: "Produtos — Sistema de Gestão" }] }),
  component: ProductsPage,
});

const schema = z.object({
  nome: z.string().min(2),
  codigo: z.string().min(1),
  categoria: z.string().min(1),
  fornecedorId: z.string().min(1, "Selecione um fornecedor"),
  valorCompra: z.coerce.number().min(0),
  valorVenda: z.coerce.number().min(0),
  estoque: z.coerce.number().min(0),
  estoqueMinimo: z.coerce.number().min(0),
  status: z.enum(["ativo", "inativo"]),
});
type Form = z.infer<typeof schema>;

const defaults: Form = { nome: "", codigo: "", categoria: "", fornecedorId: "", valorCompra: 0, valorVenda: 0, estoque: 0, estoqueMinimo: 0, status: "ativo" };

function ProductsPage() {
  const { products, suppliers, addProduct, updateProduct, removeProduct } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const openNew = () => { setEditing(null); reset(defaults); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); reset(p); setOpen(true); };

  const onSubmit = async (data: Form) => {
    const ok = editing
      ? await runAction(() => updateProduct(editing.id, data), "Produto atualizado")
      : await runAction(() => addProduct(data), "Produto cadastrado");
    if (ok) setOpen(false);
  };

  const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.empresa ?? "—";

  const columns: Column<Product>[] = [
    { key: "codigo", header: "Código", sortable: true },
    { key: "nome", header: "Produto", sortable: true },
    { key: "categoria", header: "Categoria", sortable: true },
    { key: "fornecedorId", header: "Fornecedor", render: (r) => supplierName(r.fornecedorId) },
    { key: "valorVenda", header: "Preço", sortable: true, render: (r) => brl(r.valorVenda) },
    { key: "estoque", header: "Estoque", sortable: true, render: (r) => (
      <span className={r.estoque === 0 ? "text-destructive font-semibold" : r.estoque <= r.estoqueMinimo ? "text-amber-600 font-semibold" : ""}>
        {r.estoque}
      </span>
    ) },
    { key: "status", header: "Status", render: (r) => (
      <Badge variant={r.status === "ativo" ? "default" : "secondary"}>{r.status}</Badge>
    ) },
  ];

  const cats = Array.from(new Set(products.map((p) => p.categoria))).filter(Boolean);

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle="Catálogo e controle de estoque"
        actions={<Button onClick={openNew} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Novo Produto</Button>}
      />

      <DataTable<Product>
        data={products}
        columns={columns}
        searchKeys={["nome", "codigo", "categoria"]}
        initialSort={{ key: "nome", dir: "asc" }}
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
          <DialogHeader><DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nome" error={errors.nome?.message}><Input {...register("nome")} /></Field>
            <Field label="Código" error={errors.codigo?.message}><Input {...register("codigo")} /></Field>
            <Field label="Categoria" error={errors.categoria?.message}><Input list="cats" {...register("categoria")} /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></Field>
            <Field label="Fornecedor" error={errors.fornecedorId?.message}>
              <Controller
                control={control}
                name="fornecedorId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.empresa}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Valor de Compra" error={errors.valorCompra?.message}><Input type="number" step="0.01" {...register("valorCompra")} /></Field>
            <Field label="Valor de Venda" error={errors.valorVenda?.message}><Input type="number" step="0.01" {...register("valorVenda")} /></Field>
            <Field label="Estoque" error={errors.estoque?.message}><Input type="number" {...register("estoque")} /></Field>
            <Field label="Estoque Mínimo" error={errors.estoqueMinimo?.message}><Input type="number" {...register("estoqueMinimo")} /></Field>
            <Field label="Status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange as (v: string) => void}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do Produto</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <Row label="Nome" value={viewing.nome} />
              <Row label="Código" value={viewing.codigo} />
              <Row label="Categoria" value={viewing.categoria} />
              <Row label="Fornecedor" value={supplierName(viewing.fornecedorId)} />
              <Row label="Valor Compra" value={brl(viewing.valorCompra)} />
              <Row label="Valor Venda" value={brl(viewing.valorVenda)} />
              <Row label="Margem" value={brl(viewing.valorVenda - viewing.valorCompra)} />
              <Row label="Estoque" value={viewing.estoque} />
              <Row label="Estoque Mínimo" value={viewing.estoqueMinimo} />
              <Row label="Status" value={viewing.status} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Excluir produto?"
        description={`"${toDelete?.nome ?? ""}" será removido.`}
        onConfirm={async () => { if (toDelete) { await removeProduct(toDelete.id); toast.success("Produto removido"); setToDelete(null); } }}
      />
    </div>
  );
}
