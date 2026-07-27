import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clientsService, expensesService, productsService, salesService, suppliersService } from "@/services";
import { seedIfEmpty } from "@/lib/mock-store";
import type { Client, Expense, Product, Sale, Supplier } from "@/types";

interface DataCtx {
  clients: Client[];
  suppliers: Supplier[];
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  loading: boolean;
  refresh: () => Promise<void>;

  // clients
  addClient: (d: Omit<Client, "id" | "createdAt">) => Promise<void>;
  updateClient: (id: string, d: Partial<Client>) => Promise<void>;
  removeClient: (id: string) => Promise<void>;

  // suppliers
  addSupplier: (d: Omit<Supplier, "id" | "createdAt">) => Promise<void>;
  updateSupplier: (id: string, d: Partial<Supplier>) => Promise<void>;
  removeSupplier: (id: string) => Promise<void>;

  // products
  addProduct: (d: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: string, d: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;

  // sales
  addSale: (d: Omit<Sale, "id" | "createdAt">) => Promise<void>;
  updateSale: (id: string, d: Partial<Sale>) => Promise<void>;
  removeSale: (id: string) => Promise<void>;

  // expenses
  addExpense: (d: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  updateExpense: (id: string, d: Partial<Expense>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
}

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [c, s, p, sa, e] = await Promise.all([
      clientsService.list(),
      suppliersService.list(),
      productsService.list(),
      salesService.list(),
      expensesService.list(),
    ]);
    setClients(c);
    setSuppliers(s);
    setProducts(p);
    setSales(sa);
    setExpenses(e);
  }, []);

  useEffect(() => {
    seedIfEmpty();
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const value = useMemo<DataCtx>(() => ({
    clients, suppliers, products, sales, expenses, loading, refresh,
    addClient: async (d) => { await clientsService.create(d); await refresh(); },
    updateClient: async (id, d) => { await clientsService.update(id, d); await refresh(); },
    removeClient: async (id) => { await clientsService.remove(id); await refresh(); },
    addSupplier: async (d) => { await suppliersService.create(d); await refresh(); },
    updateSupplier: async (id, d) => { await suppliersService.update(id, d); await refresh(); },
    removeSupplier: async (id) => { await suppliersService.remove(id); await refresh(); },
    addProduct: async (d) => { await productsService.create(d); await refresh(); },
    updateProduct: async (id, d) => { await productsService.update(id, d); await refresh(); },
    removeProduct: async (id) => { await productsService.remove(id); await refresh(); },
    addSale: async (d) => { await salesService.create(d); await refresh(); },
    updateSale: async (id, d) => { await salesService.update(id, d); await refresh(); },
    removeSale: async (id) => { await salesService.remove(id); await refresh(); },
    addExpense: async (d) => { await expensesService.create(d); await refresh(); },
    updateExpense: async (id, d) => { await expensesService.update(id, d); await refresh(); },
    removeExpense: async (id) => { await expensesService.remove(id); await refresh(); },
  }), [clients, suppliers, products, sales, expenses, loading, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useData must be used inside DataProvider");
  return c;
}
