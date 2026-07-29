/**
 * Service layer — Lovable Cloud (Supabase) backed.
 * Each service maps snake_case columns to camelCase types.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Client, Expense, PaymentMethod, Product, Sale, Supplier } from "@/types";

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Não autenticado");
  return data.user.id;
}

// ============ CLIENTS ============
type ClientRow = {
  id: string; nome: string; documento: string; telefone: string;
  email: string; cidade: string; endereco: string; observacoes: string;
  created_at: string;
};
const toClient = (r: ClientRow): Client => ({
  id: r.id, nome: r.nome, documento: r.documento, telefone: r.telefone,
  email: r.email, cidade: r.cidade, endereco: r.endereco,
  observacoes: r.observacoes, createdAt: r.created_at,
});

export const clientsService = {
  list: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toClient);
  },
  create: async (d: Omit<Client, "id" | "createdAt">): Promise<Client> => {
    const user_id = await currentUserId();
    const { data, error } = await supabase.from("clients").insert({
      user_id, nome: d.nome, documento: d.documento, telefone: d.telefone,
      email: d.email, cidade: d.cidade, endereco: d.endereco, observacoes: d.observacoes,
    }).select().single();
    if (error) throw error;
    return toClient(data);
  },
  update: async (id: string, d: Partial<Client>): Promise<Client> => {
    const { data, error } = await supabase.from("clients").update({
      nome: d.nome, documento: d.documento, telefone: d.telefone,
      email: d.email, cidade: d.cidade, endereco: d.endereco, observacoes: d.observacoes,
    }).eq("id", id).select().single();
    if (error) throw error;
    return toClient(data);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ============ SUPPLIERS ============
type SupplierRow = {
  id: string; empresa: string; cnpj: string; responsavel: string;
  telefone: string; email: string; endereco: string; created_at: string;
};
const toSupplier = (r: SupplierRow): Supplier => ({
  id: r.id, empresa: r.empresa, cnpj: r.cnpj, responsavel: r.responsavel,
  telefone: r.telefone, email: r.email, endereco: r.endereco, createdAt: r.created_at,
});

export const suppliersService = {
  list: async (): Promise<Supplier[]> => {
    const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toSupplier);
  },
  create: async (d: Omit<Supplier, "id" | "createdAt">): Promise<Supplier> => {
    const user_id = await currentUserId();
    const { data, error } = await supabase.from("suppliers").insert({
      user_id, empresa: d.empresa, cnpj: d.cnpj, responsavel: d.responsavel,
      telefone: d.telefone, email: d.email, endereco: d.endereco,
    }).select().single();
    if (error) throw error;
    return toSupplier(data);
  },
  update: async (id: string, d: Partial<Supplier>): Promise<Supplier> => {
    const { data, error } = await supabase.from("suppliers").update({
      empresa: d.empresa, cnpj: d.cnpj, responsavel: d.responsavel,
      telefone: d.telefone, email: d.email, endereco: d.endereco,
    }).eq("id", id).select().single();
    if (error) throw error;
    return toSupplier(data);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ============ PRODUCTS ============
type ProductRow = {
  id: string; nome: string; codigo: string; categoria: string;
  fornecedor_id: string | null; valor_compra: number; valor_venda: number;
  estoque: number; estoque_minimo: number; status: string; created_at: string;
};
const toProduct = (r: ProductRow): Product => ({
  id: r.id, nome: r.nome, codigo: r.codigo, categoria: r.categoria,
  fornecedorId: r.fornecedor_id ?? "", valorCompra: Number(r.valor_compra),
  valorVenda: Number(r.valor_venda), estoque: r.estoque,
  estoqueMinimo: r.estoque_minimo, status: (r.status as "ativo" | "inativo"),
  createdAt: r.created_at,
});

export const productsService = {
  list: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toProduct);
  },
  create: async (d: Omit<Product, "id" | "createdAt">): Promise<Product> => {
    const user_id = await currentUserId();
    const { data, error } = await supabase.from("products").insert({
      user_id, nome: d.nome, codigo: d.codigo, categoria: d.categoria,
      fornecedor_id: d.fornecedorId || null,
      valor_compra: d.valorCompra, valor_venda: d.valorVenda,
      estoque: d.estoque, estoque_minimo: d.estoqueMinimo, status: d.status,
    }).select().single();
    if (error) throw error;
    return toProduct(data);
  },
  update: async (id: string, d: Partial<Product>): Promise<Product> => {
    const payload: Record<string, unknown> = {};
    if (d.nome !== undefined) payload.nome = d.nome;
    if (d.codigo !== undefined) payload.codigo = d.codigo;
    if (d.categoria !== undefined) payload.categoria = d.categoria;
    if (d.fornecedorId !== undefined) payload.fornecedor_id = d.fornecedorId || null;
    if (d.valorCompra !== undefined) payload.valor_compra = d.valorCompra;
    if (d.valorVenda !== undefined) payload.valor_venda = d.valorVenda;
    if (d.estoque !== undefined) payload.estoque = d.estoque;
    if (d.estoqueMinimo !== undefined) payload.estoque_minimo = d.estoqueMinimo;
    if (d.status !== undefined) payload.status = d.status;
    const { data, error } = await supabase.from("products").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return toProduct(data);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ============ SALES ============
type SaleRow = {
  id: string; cliente_id: string | null; produto_id: string | null;
  quantidade: number; valor_unitario: number; desconto: number;
  valor_total: number; forma_pagamento: string; data: string; created_at: string;
};
const toSale = (r: SaleRow): Sale => ({
  id: r.id, clienteId: r.cliente_id ?? "", produtoId: r.produto_id ?? "",
  quantidade: r.quantidade, valorUnitario: Number(r.valor_unitario),
  desconto: Number(r.desconto), valorTotal: Number(r.valor_total),
  formaPagamento: r.forma_pagamento as PaymentMethod, data: r.data,
  createdAt: r.created_at,
});

export const salesService = {
  list: async (): Promise<Sale[]> => {
    const { data, error } = await supabase.from("sales").select("*").order("data", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toSale);
  },
  create: async (d: Omit<Sale, "id" | "createdAt">): Promise<Sale> => {
    const user_id = await currentUserId();
    const { data, error } = await supabase.from("sales").insert({
      user_id, cliente_id: d.clienteId || null, produto_id: d.produtoId || null,
      quantidade: d.quantidade, valor_unitario: d.valorUnitario,
      desconto: d.desconto, valor_total: d.valorTotal,
      forma_pagamento: d.formaPagamento, data: d.data,
    }).select().single();
    if (error) throw error;
    return toSale(data);
  },
  update: async (id: string, d: Partial<Sale>): Promise<Sale> => {
    const payload: Record<string, unknown> = {};
    if (d.clienteId !== undefined) payload.cliente_id = d.clienteId || null;
    if (d.produtoId !== undefined) payload.produto_id = d.produtoId || null;
    if (d.quantidade !== undefined) payload.quantidade = d.quantidade;
    if (d.valorUnitario !== undefined) payload.valor_unitario = d.valorUnitario;
    if (d.desconto !== undefined) payload.desconto = d.desconto;
    if (d.valorTotal !== undefined) payload.valor_total = d.valorTotal;
    if (d.formaPagamento !== undefined) payload.forma_pagamento = d.formaPagamento;
    if (d.data !== undefined) payload.data = d.data;
    const { data, error } = await supabase.from("sales").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return toSale(data);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ============ EXPENSES ============
type ExpenseRow = {
  id: string; descricao: string; categoria: string;
  valor: number; data: string; created_at: string;
};
const toExpense = (r: ExpenseRow): Expense => ({
  id: r.id, descricao: r.descricao, categoria: r.categoria,
  valor: Number(r.valor), data: r.data, createdAt: r.created_at,
});

export const expensesService = {
  list: async (): Promise<Expense[]> => {
    const { data, error } = await supabase.from("expenses").select("*").order("data", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toExpense);
  },
  create: async (d: Omit<Expense, "id" | "createdAt">): Promise<Expense> => {
    const user_id = await currentUserId();
    const { data, error } = await supabase.from("expenses").insert({
      user_id, descricao: d.descricao, categoria: d.categoria,
      valor: d.valor, data: d.data,
    }).select().single();
    if (error) throw error;
    return toExpense(data);
  },
  update: async (id: string, d: Partial<Expense>): Promise<Expense> => {
    const payload: Record<string, unknown> = {};
    if (d.descricao !== undefined) payload.descricao = d.descricao;
    if (d.categoria !== undefined) payload.categoria = d.categoria;
    if (d.valor !== undefined) payload.valor = d.valor;
    if (d.data !== undefined) payload.data = d.data;
    const { data, error } = await supabase.from("expenses").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return toExpense(data);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
