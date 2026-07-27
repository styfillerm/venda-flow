import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2, Eye } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useData } from "@/context/DataContext";
import type { Supplier } from "@/types";
import { Field, Row } from "./_app.clientes";
import { dateBR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/fornecedores")({
  head: () => ({ meta: [{ title: "Fornecedores — Sistema de Gestão" }] }),
  component: SuppliersPage,
});

const schema = z.object({
  empresa: z.string().min(2, "Informe a empresa"),
  cnpj: z.string().min(3, "Informe o CNPJ"),
  responsavel: z.string().min(2, "Informe o responsável"),
  telefone: z.string().min(3),
  email: z.string().email(),
  endereco: z.string().default(""),
});
type Form = z.infer<typeof schema>;

function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, removeSupplier } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [viewing, setViewing] = useState<Supplier | null>(null);
  const [toDelete, setToDelete] = useState<Supplier | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { empresa: "", cnpj: "", responsavel: "", telefone: "", email: "", endereco: "" },
  });

  const openNew = () => { setEditing(null); reset({ empresa: "", cnpj: "", responsavel: "", telefone: "", email: "", endereco: "" }); setOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); reset(s); setOpen(true); };

  const onSubmit = async (data: Form) => {
    if (editing) { await updateSupplier(editing.id, data); toast.success("Fornecedor atualizado"); }
    else { await addSupplier(data); toast.success("Fornecedor cadastrado"); }
    setOpen(false);
  };

  const columns: Column<Supplier>[] = [
    { key: "empresa", header: "Empresa", sortable: true },
    { key: "cnpj", header: "CNPJ" },
    { key: "responsavel", header: "Responsável", sortable: true },
    { key: "telefone", header: "Telefone" },
    { key: "email", header: "Email" },
  ];

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        subtitle="Cadastro de parceiros e distribuidores"
        actions={<Button onClick={openNew} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Novo Fornecedor</Button>}
      />

      <DataTable<Supplier>
        data={suppliers}
        columns={columns}
        searchKeys={["empresa", "cnpj", "responsavel", "email"]}
        initialSort={{ key: "empresa", dir: "asc" }}
        actions={(row) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => setViewing(row)}><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Empresa" error={errors.empresa?.message}><Input {...register("empresa")} /></Field>
            <Field label="CNPJ" error={errors.cnpj?.message}><Input {...register("cnpj")} /></Field>
            <Field label="Responsável" error={errors.responsavel?.message}><Input {...register("responsavel")} /></Field>
            <Field label="Telefone" error={errors.telefone?.message}><Input {...register("telefone")} /></Field>
            <Field label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
            <Field label="Endereço"><Input {...register("endereco")} /></Field>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do Fornecedor</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <Row label="Empresa" value={viewing.empresa} />
              <Row label="CNPJ" value={viewing.cnpj} />
              <Row label="Responsável" value={viewing.responsavel} />
              <Row label="Telefone" value={viewing.telefone} />
              <Row label="Email" value={viewing.email} />
              <Row label="Endereço" value={viewing.endereco || "—"} />
              <Row label="Cadastro" value={dateBR(viewing.createdAt)} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Excluir fornecedor?"
        description={`O fornecedor "${toDelete?.empresa ?? ""}" será removido.`}
        onConfirm={async () => { if (toDelete) { await removeSupplier(toDelete.id); toast.success("Fornecedor removido"); setToDelete(null); } }}
      />
    </div>
  );
}
