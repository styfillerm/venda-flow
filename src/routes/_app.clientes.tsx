import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2, Eye } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useData } from "@/context/DataContext";
import type { Client } from "@/types";
import { dateBR } from "@/lib/format";
import { runAction } from "@/lib/errors";

export const Route = createFileRoute("/_app/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Sistema de Gestão" }] }),
  component: ClientesPage,
});

const schema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  documento: z.string().min(3, "Informe CPF/CNPJ"),
  telefone: z.string().min(3, "Informe o telefone"),
  email: z.string().email("Email inválido"),
  cidade: z.string().min(1, "Informe a cidade"),
  endereco: z.string(),
  observacoes: z.string(),
});
type Form = z.infer<typeof schema>;

function ClientesPage() {
  const { clients, addClient, updateClient, removeClient } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [viewing, setViewing] = useState<Client | null>(null);
  const [toDelete, setToDelete] = useState<Client | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", documento: "", telefone: "", email: "", cidade: "", endereco: "", observacoes: "" },
  });

  const openNew = () => { setEditing(null); reset({ nome: "", documento: "", telefone: "", email: "", cidade: "", endereco: "", observacoes: "" }); setOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); reset(c); setOpen(true); };

  const onSubmit = async (data: Form) => {
    const ok = editing
      ? await runAction(() => updateClient(editing.id, data), "Cliente atualizado")
      : await runAction(() => addClient(data), "Cliente cadastrado");
    if (ok) setOpen(false);
  };

  const columns: Column<Client>[] = [
    { key: "nome", header: "Nome", sortable: true },
    { key: "documento", header: "CPF/CNPJ" },
    { key: "telefone", header: "Telefone" },
    { key: "email", header: "Email", sortable: true },
    { key: "cidade", header: "Cidade", sortable: true },
    { key: "createdAt", header: "Cadastro", sortable: true, render: (r) => dateBR(r.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Gerencie sua base de clientes"
        actions={<Button onClick={openNew} className="rounded-xl"><Plus className="h-4 w-4 mr-1" /> Novo Cliente</Button>}
      />

      <DataTable<Client>
        data={clients}
        columns={columns}
        searchKeys={["nome", "documento", "email", "cidade"]}
        searchPlaceholder="Buscar por nome, CPF/CNPJ, email..."
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>Preencha os dados do cliente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nome" error={errors.nome?.message}><Input {...register("nome")} /></Field>
            <Field label="CPF/CNPJ" error={errors.documento?.message}><Input {...register("documento")} /></Field>
            <Field label="Telefone" error={errors.telefone?.message}><Input {...register("telefone")} /></Field>
            <Field label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
            <Field label="Cidade" error={errors.cidade?.message}><Input {...register("cidade")} /></Field>
            <Field label="Endereço"><Input {...register("endereco")} /></Field>
            <div className="sm:col-span-2">
              <Field label="Observações"><Textarea rows={3} {...register("observacoes")} /></Field>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do Cliente</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <Row label="Nome" value={viewing.nome} />
              <Row label="Documento" value={viewing.documento} />
              <Row label="Email" value={viewing.email} />
              <Row label="Telefone" value={viewing.telefone} />
              <Row label="Cidade" value={viewing.cidade} />
              <Row label="Endereço" value={viewing.endereco || "—"} />
              <Row label="Observações" value={viewing.observacoes || "—"} />
              <Row label="Cadastro" value={dateBR(viewing.createdAt)} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Excluir cliente?"
        description={`O cliente "${toDelete?.nome ?? ""}" será removido.`}
        onConfirm={async () => { if (toDelete && await runAction(() => removeClient(toDelete.id), "Cliente removido")) setToDelete(null); }}
      />
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
export function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
