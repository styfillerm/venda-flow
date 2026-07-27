export interface Client {
  id: string;
  nome: string;
  documento: string; // CPF/CNPJ
  telefone: string;
  email: string;
  cidade: string;
  endereco: string;
  observacoes: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  empresa: string;
  cnpj: string;
  responsavel: string;
  telefone: string;
  email: string;
  endereco: string;
  createdAt: string;
}

export interface Product {
  id: string;
  nome: string;
  codigo: string;
  categoria: string;
  fornecedorId: string;
  valorCompra: number;
  valorVenda: number;
  estoque: number;
  estoqueMinimo: number;
  status: "ativo" | "inativo";
  createdAt: string;
}

export type PaymentMethod = "dinheiro" | "pix" | "cartao_credito" | "cartao_debito" | "boleto";

export interface Sale {
  id: string;
  clienteId: string;
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
  desconto: number;
  valorTotal: number;
  formaPagamento: PaymentMethod;
  data: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  createdAt: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
}
