import type { Client, Expense, Product, Sale, Supplier } from "@/types";

const KEYS = {
  clients: "sgv_clients",
  suppliers: "sgv_suppliers",
  products: "sgv_products",
  sales: "sgv_sales",
  expenses: "sgv_expenses",
  seeded: "sgv_seeded_v2",
} as const;

export const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));

function read<T>(k: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(k) || "[]") as T[];
  } catch {
    return [];
  }
}
function write<T>(k: string, v: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
}

export const store = {
  clients: {
    all: () => read<Client>(KEYS.clients),
    save: (v: Client[]) => write(KEYS.clients, v),
  },
  suppliers: {
    all: () => read<Supplier>(KEYS.suppliers),
    save: (v: Supplier[]) => write(KEYS.suppliers, v),
  },
  products: {
    all: () => read<Product>(KEYS.products),
    save: (v: Product[]) => write(KEYS.products, v),
  },
  sales: {
    all: () => read<Sale>(KEYS.sales),
    save: (v: Sale[]) => write(KEYS.sales, v),
  },
  expenses: {
    all: () => read<Expense>(KEYS.expenses),
    save: (v: Expense[]) => write(KEYS.expenses, v),
  },
};

function nowISO(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(KEYS.seeded)) return;

  const suppliers: Supplier[] = [
    { id: uid(), empresa: "TechDistribuidora Ltda", cnpj: "12.345.678/0001-90", responsavel: "Carlos Mendes", telefone: "(11) 98765-4321", email: "contato@techdist.com", endereco: "Av. Paulista, 1000 - São Paulo/SP", createdAt: nowISO(120) },
    { id: uid(), empresa: "Fashion Wholesale", cnpj: "98.765.432/0001-10", responsavel: "Ana Souza", telefone: "(21) 91234-5678", email: "vendas@fashionw.com", endereco: "Rua da Moda, 250 - Rio de Janeiro/RJ", createdAt: nowISO(90) },
    { id: uid(), empresa: "Casa & Decoração SA", cnpj: "45.678.912/0001-33", responsavel: "Pedro Lima", telefone: "(31) 99887-6655", email: "sac@casadeco.com", endereco: "Rua das Flores, 55 - Belo Horizonte/MG", createdAt: nowISO(60) },
    { id: uid(), empresa: "Alimentos Prime", cnpj: "22.333.444/0001-55", responsavel: "Marta Alves", telefone: "(41) 98888-1111", email: "comercial@alprime.com", endereco: "Av. Central, 780 - Curitiba/PR", createdAt: nowISO(40) },
  ];

  const categorias = ["Eletrônicos", "Vestuário", "Casa", "Alimentos", "Acessórios"];
  const products: Product[] = [
    { id: uid(), nome: "Smartphone Pro X", codigo: "SKU-001", categoria: "Eletrônicos", fornecedorId: suppliers[0].id, valorCompra: 1800, valorVenda: 2799, estoque: 24, estoqueMinimo: 5, status: "ativo", createdAt: nowISO(80) },
    { id: uid(), nome: "Notebook Ultra 15", codigo: "SKU-002", categoria: "Eletrônicos", fornecedorId: suppliers[0].id, valorCompra: 3200, valorVenda: 4599, estoque: 12, estoqueMinimo: 3, status: "ativo", createdAt: nowISO(75) },
    { id: uid(), nome: "Fone Bluetooth", codigo: "SKU-003", categoria: "Eletrônicos", fornecedorId: suppliers[0].id, valorCompra: 90, valorVenda: 199, estoque: 4, estoqueMinimo: 10, status: "ativo", createdAt: nowISO(70) },
    { id: uid(), nome: "Camiseta Premium", codigo: "SKU-004", categoria: "Vestuário", fornecedorId: suppliers[1].id, valorCompra: 25, valorVenda: 79, estoque: 60, estoqueMinimo: 20, status: "ativo", createdAt: nowISO(65) },
    { id: uid(), nome: "Calça Jeans Slim", codigo: "SKU-005", categoria: "Vestuário", fornecedorId: suppliers[1].id, valorCompra: 55, valorVenda: 159, estoque: 0, estoqueMinimo: 15, status: "ativo", createdAt: nowISO(60) },
    { id: uid(), nome: "Luminária LED", codigo: "SKU-006", categoria: "Casa", fornecedorId: suppliers[2].id, valorCompra: 40, valorVenda: 119, estoque: 18, estoqueMinimo: 8, status: "ativo", createdAt: nowISO(55) },
    { id: uid(), nome: "Jogo de Panelas", codigo: "SKU-007", categoria: "Casa", fornecedorId: suppliers[2].id, valorCompra: 180, valorVenda: 399, estoque: 6, estoqueMinimo: 4, status: "ativo", createdAt: nowISO(50) },
    { id: uid(), nome: "Café Especial 500g", codigo: "SKU-008", categoria: "Alimentos", fornecedorId: suppliers[3].id, valorCompra: 18, valorVenda: 45, estoque: 120, estoqueMinimo: 30, status: "ativo", createdAt: nowISO(45) },
    { id: uid(), nome: "Chocolate Gourmet", codigo: "SKU-009", categoria: "Alimentos", fornecedorId: suppliers[3].id, valorCompra: 8, valorVenda: 24, estoque: 200, estoqueMinimo: 50, status: "ativo", createdAt: nowISO(40) },
    { id: uid(), nome: "Relógio Clássico", codigo: "SKU-010", categoria: "Acessórios", fornecedorId: suppliers[1].id, valorCompra: 120, valorVenda: 299, estoque: 9, estoqueMinimo: 5, status: "ativo", createdAt: nowISO(35) },
  ];

  const clients: Client[] = [
    { id: uid(), nome: "João Silva", documento: "123.456.789-00", telefone: "(11) 91111-2222", email: "joao@email.com", cidade: "São Paulo", endereco: "Rua A, 100", observacoes: "Cliente VIP", createdAt: nowISO(100) },
    { id: uid(), nome: "Maria Oliveira", documento: "234.567.890-11", telefone: "(21) 92222-3333", email: "maria@email.com", cidade: "Rio de Janeiro", endereco: "Rua B, 200", observacoes: "", createdAt: nowISO(90) },
    { id: uid(), nome: "Empresa ABC Ltda", documento: "11.222.333/0001-44", telefone: "(11) 3333-4444", email: "contato@abc.com", cidade: "São Paulo", endereco: "Av. Central, 500", observacoes: "Compras corporativas", createdAt: nowISO(80) },
    { id: uid(), nome: "Carlos Pereira", documento: "345.678.901-22", telefone: "(31) 93333-4444", email: "carlos@email.com", cidade: "Belo Horizonte", endereco: "Rua C, 300", observacoes: "", createdAt: nowISO(70) },
    { id: uid(), nome: "Fernanda Costa", documento: "456.789.012-33", telefone: "(41) 94444-5555", email: "fernanda@email.com", cidade: "Curitiba", endereco: "Rua D, 400", observacoes: "Prefere PIX", createdAt: nowISO(60) },
    { id: uid(), nome: "Rafael Souza", documento: "567.890.123-44", telefone: "(51) 95555-6666", email: "rafael@email.com", cidade: "Porto Alegre", endereco: "Rua E, 500", observacoes: "", createdAt: nowISO(50) },
    { id: uid(), nome: "Juliana Rocha", documento: "678.901.234-55", telefone: "(11) 96666-7777", email: "juliana@email.com", cidade: "Campinas", endereco: "Rua F, 600", observacoes: "", createdAt: nowISO(40) },
  ];

  // Generate sales across last 6 months
  const sales: Sale[] = [];
  const payments: Sale["formaPagamento"][] = ["dinheiro", "pix", "cartao_credito", "cartao_debito", "boleto"];
  const today = new Date();
  for (let m = 5; m >= 0; m--) {
    const monthSales = 8 + Math.floor(Math.random() * 12);
    for (let i = 0; i < monthSales; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - m, 1 + Math.floor(Math.random() * 27));
      const p = products[Math.floor(Math.random() * products.length)];
      const c = clients[Math.floor(Math.random() * clients.length)];
      const qtd = 1 + Math.floor(Math.random() * 4);
      const desc = Math.random() > 0.7 ? Math.round(p.valorVenda * 0.05) : 0;
      const total = p.valorVenda * qtd - desc;
      sales.push({
        id: uid(),
        clienteId: c.id,
        produtoId: p.id,
        quantidade: qtd,
        valorUnitario: p.valorVenda,
        desconto: desc,
        valorTotal: total,
        formaPagamento: payments[Math.floor(Math.random() * payments.length)],
        data: d.toISOString(),
        createdAt: d.toISOString(),
      });
    }
  }

  const expenses: Expense[] = [];
  const catExp = ["Aluguel", "Fornecedores", "Salários", "Marketing", "Energia", "Internet"];
  for (let m = 5; m >= 0; m--) {
    for (let i = 0; i < 4; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - m, 5 + i * 6);
      const cat = catExp[Math.floor(Math.random() * catExp.length)];
      expenses.push({
        id: uid(),
        descricao: `${cat} - ${d.toLocaleDateString("pt-BR", { month: "long" })}`,
        categoria: cat,
        valor: 500 + Math.floor(Math.random() * 4500),
        data: d.toISOString(),
        createdAt: d.toISOString(),
      });
    }
  }

  store.suppliers.save(suppliers);
  store.products.save(products);
  store.clients.save(clients);
  store.sales.save(sales);
  store.expenses.save(expenses);
  window.localStorage.setItem(KEYS.seeded, "1");
}
