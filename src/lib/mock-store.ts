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

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(KEYS.seeded)) return;

  // Start fresh — no fictitious data.
  store.suppliers.save([]);
  store.products.save([]);
  store.clients.save([]);
  store.sales.save([]);
  store.expenses.save([]);
  window.localStorage.setItem(KEYS.seeded, "1");
}
