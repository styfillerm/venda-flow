import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingCart, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Sistema de Gestão de Vendas" },
      { name: "description", content: "Acesse o painel de gestão de vendas." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Senha muito curta"),
});
type FormData = z.infer<typeof schema>;

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@gestao.com", password: "admin123" },
  });

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate({ to: "/dashboard" });
    } catch {
      setError("Não foi possível autenticar. Verifique suas credenciais.");
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary to-blue-600 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">Sistema de Gestão</p>
            <p className="text-xs text-white/70">Vendas & Estoque</p>
          </div>
        </div>
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Controle total do seu negócio, <br />em um só lugar.
          </h1>
          <p className="text-white/80 max-w-md">
            Gerencie clientes, produtos, estoque, vendas e financeiro com um painel moderno inspirado nos melhores ERPs do mercado.
          </p>
        </div>
        <p className="text-xs text-white/60">© {new Date().getFullYear()} Sistema de Gestão de Vendas</p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <p className="font-semibold">Sistema de Gestão</p>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h2>
          <p className="mt-1 text-sm text-muted-foreground">Entre com suas credenciais para acessar o painel.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" placeholder="voce@empresa.com" className="pl-9" {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" className="pl-9" {...register("password")} />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full h-11 rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Dica: use qualquer email/senha válidos — a autenticação está mockada.
            </p>
            <p className="text-center text-xs">
              <Link to="/dashboard" className="text-primary hover:underline">Ir direto ao painel</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
