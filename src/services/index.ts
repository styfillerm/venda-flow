/**
 * Service layer — currently uses an in-memory/localStorage mock store.
 * To integrate a real backend (Node.js + Express + PostgreSQL) later,
 * replace each function body with the equivalent `api.get/post/put/delete` call.
 *
 * Example future replacement:
 *   list: async () => (await api.get<Client[]>("/clients")).data,
 */
import { store, uid } from "@/lib/mock-store";
import type { Client, Expense, Product, Sale, Supplier } from "@/types";

// tiny delay to emulate async
const delay = <T>(v: T, ms = 120) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const clientsService = {
  list: () => delay(store.clients.all()),
  create: (data: Omit<Client, "id" | "createdAt">) => {
    const all = store.clients.all();
    const c: Client = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.clients.save([c, ...all]);
    return delay(c);
  },
  update: (id: string, data: Partial<Client>) => {
    const all = store.clients.all().map((c) => (c.id === id ? { ...c, ...data } : c));
    store.clients.save(all);
    return delay(all.find((c) => c.id === id)!);
  },
  remove: (id: string) => {
    store.clients.save(store.clients.all().filter((c) => c.id !== id));
    return delay(true);
  },
};

export const suppliersService = {
  list: () => delay(store.suppliers.all()),
  create: (data: Omit<Supplier, "id" | "createdAt">) => {
    const s: Supplier = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.suppliers.save([s, ...store.suppliers.all()]);
    return delay(s);
  },
  update: (id: string, data: Partial<Supplier>) => {
    const all = store.suppliers.all().map((s) => (s.id === id ? { ...s, ...data } : s));
    store.suppliers.save(all);
    return delay(all.find((s) => s.id === id)!);
  },
  remove: (id: string) => {
    store.suppliers.save(store.suppliers.all().filter((s) => s.id !== id));
    return delay(true);
  },
};

export const productsService = {
  list: () => delay(store.products.all()),
  create: (data: Omit<Product, "id" | "createdAt">) => {
    const p: Product = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.products.save([p, ...store.products.all()]);
    return delay(p);
  },
  update: (id: string, data: Partial<Product>) => {
    const all = store.products.all().map((p) => (p.id === id ? { ...p, ...data } : p));
    store.products.save(all);
    return delay(all.find((p) => p.id === id)!);
  },
  remove: (id: string) => {
    store.products.save(store.products.all().filter((p) => p.id !== id));
    return delay(true);
  },
  decrementStock: (id: string, qty: number) => {
    const all = store.products.all().map((p) =>
      p.id === id ? { ...p, estoque: Math.max(0, p.estoque - qty) } : p,
    );
    store.products.save(all);
  },
  incrementStock: (id: string, qty: number) => {
    const all = store.products.all().map((p) =>
      p.id === id ? { ...p, estoque: p.estoque + qty } : p,
    );
    store.products.save(all);
  },
};

export const salesService = {
  list: () => delay(store.sales.all()),
  create: (data: Omit<Sale, "id" | "createdAt">) => {
    const s: Sale = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.sales.save([s, ...store.sales.all()]);
    // side-effect: decrement stock
    productsService.decrementStock(s.produtoId, s.quantidade);
    return delay(s);
  },
  update: (id: string, data: Partial<Sale>) => {
    const prev = store.sales.all().find((s) => s.id === id);
    const all = store.sales.all().map((s) => (s.id === id ? { ...s, ...data } : s));
    store.sales.save(all);
    // adjust stock if quantity or product changed
    if (prev && data.quantidade !== undefined && data.quantidade !== prev.quantidade) {
      const diff = data.quantidade - prev.quantidade;
      if (diff > 0) productsService.decrementStock(prev.produtoId, diff);
      else productsService.incrementStock(prev.produtoId, -diff);
    }
    return delay(all.find((s) => s.id === id)!);
  },
  remove: (id: string) => {
    const s = store.sales.all().find((x) => x.id === id);
    if (s) productsService.incrementStock(s.produtoId, s.quantidade);
    store.sales.save(store.sales.all().filter((x) => x.id !== id));
    return delay(true);
  },
};

export const expensesService = {
  list: () => delay(store.expenses.all()),
  create: (data: Omit<Expense, "id" | "createdAt">) => {
    const e: Expense = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.expenses.save([e, ...store.expenses.all()]);
    return delay(e);
  },
  update: (id: string, data: Partial<Expense>) => {
    const all = store.expenses.all().map((e) => (e.id === id ? { ...e, ...data } : e));
    store.expenses.save(all);
    return delay(all.find((e) => e.id === id)!);
  },
  remove: (id: string) => {
    store.expenses.save(store.expenses.all().filter((e) => e.id !== id));
    return delay(true);
  },
};
