import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  DollarSign, TrendingUp, ShoppingCart, Package, Users, Truck, Boxes, AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { useData } from "@/context/DataContext";
import { brl, monthKey, monthLabel, num } from "@/lib/format";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Sistema de Gestão" },
      { name: "description", content: "Indicadores e gráficos do seu negócio." },
    ],
  }),
  component: DashboardPage,
});

const CHART_COLORS = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function DashboardPage() {
  const { sales, products, clients, suppliers, expenses } = useData();

  const kpis = useMemo(() => {
    const receita = sales.reduce((s, x) => s + x.valorTotal, 0);
    const custo = sales.reduce((s, x) => {
      const p = products.find((pp) => pp.id === x.produtoId);
      return s + (p ? p.valorCompra * x.quantidade : 0);
    }, 0);
    const desp = expenses.reduce((s, x) => s + x.valor, 0);
    const lucro = receita - custo - desp;
    const totalVendas = sales.length;
    const prodVendidos = sales.reduce((s, x) => s + x.quantidade, 0);
    const emEstoque = products.reduce((s, p) => s + p.estoque, 0);
    const baixo = products.filter((p) => p.estoque > 0 && p.estoque <= p.estoqueMinimo).length;
    return { receita, lucro, totalVendas, prodVendidos, emEstoque, baixo, custo, desp };
  }, [sales, products, expenses]);

  const monthly = useMemo(() => {
    const map = new Map<string, { key: string; receita: number; vendas: number; lucro: number }>();
    // last 6 months buckets
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(k, { key: k, receita: 0, vendas: 0, lucro: 0 });
    }
    sales.forEach((s) => {
      const k = monthKey(s.data);
      const cur = map.get(k);
      if (!cur) return;
      cur.receita += s.valorTotal;
      cur.vendas += 1;
      const p = products.find((pp) => pp.id === s.produtoId);
      cur.lucro += s.valorTotal - (p ? p.valorCompra * s.quantidade : 0);
    });
    return Array.from(map.values()).map((m) => ({ ...m, label: monthLabel(m.key) }));
  }, [sales, products]);

  const topProducts = useMemo(() => {
    const counts = new Map<string, number>();
    sales.forEach((s) => counts.set(s.produtoId, (counts.get(s.produtoId) ?? 0) + s.quantidade));
    return Array.from(counts.entries())
      .map(([id, qty]) => ({ nome: products.find((p) => p.id === id)?.nome ?? "—", qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales, products]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach((s) => {
      const p = products.find((pp) => pp.id === s.produtoId);
      if (!p) return;
      map.set(p.categoria, (map.get(p.categoria) ?? 0) + s.valorTotal);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [sales, products]);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral do seu negócio em tempo real" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Receita Total" value={brl(kpis.receita)} icon={DollarSign} tone="primary" trend="Todas as vendas registradas" />
        <StatCard title="Lucro" value={brl(kpis.lucro)} icon={TrendingUp} tone="success" trend={`Despesas: ${brl(kpis.desp)}`} />
        <StatCard title="Total de Vendas" value={num(kpis.totalVendas)} icon={ShoppingCart} tone="neutral" />
        <StatCard title="Produtos Vendidos" value={num(kpis.prodVendidos)} icon={Package} tone="neutral" />
        <StatCard title="Clientes Cadastrados" value={num(clients.length)} icon={Users} tone="primary" />
        <StatCard title="Fornecedores" value={num(suppliers.length)} icon={Truck} tone="neutral" />
        <StatCard title="Produtos em Estoque" value={num(kpis.emEstoque)} icon={Boxes} tone="success" />
        <StatCard title="Estoque Baixo" value={num(kpis.baixo)} icon={AlertTriangle} tone="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader><CardTitle>Receita e Lucro (últimos 6 meses)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Legend />
                <Line type="monotone" dataKey="receita" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Receita" />
                <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Participação por Categoria</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Vendas por Mês</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="vendas" fill="#2563eb" radius={[8, 8, 0, 0]} name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Produtos Mais Vendidos</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="nome" fontSize={11} width={110} />
                <Tooltip />
                <Bar dataKey="qty" fill="#10b981" radius={[0, 8, 8, 0]} name="Unidades" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Categorias Mais Vendidas</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
