import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — PodGYN" },
      { name: "description", content: "Acesse o painel PodGYN de gestão de vendas." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) toast.error(error.message);
        else navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await signUp(email, password, nome);
        if (error) toast.error(error.message);
        else toast.success("Conta criada! Verifique seu e-mail se a confirmação estiver ativada.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Falha ao entrar com Google");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div
        className="flex h-16 items-center justify-center px-4 text-white shadow-md"
        style={{ background: "linear-gradient(90deg, #6d28d9 0%, #9333ea 45%, #eab308 100%)" }}
      >
        <h1 className="text-2xl font-bold tracking-[0.2em] text-white drop-shadow-sm">PodGYN</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-2">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Sistema de Gestão de Vendas
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full text-white"
              style={{ background: "linear-gradient(90deg, #7c3aed, #eab308)" }}
            >
              {busy ? "Aguarde..." : mode === "signin" ? "Entrar" : "Cadastrar"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button variant="outline" onClick={handleGoogle} disabled={busy} className="w-full">
            Entrar com Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>Não tem conta?{" "}
                <button type="button" className="text-primary font-medium" onClick={() => setMode("signup")}>Cadastre-se</button>
              </>
            ) : (
              <>Já tem conta?{" "}
                <button type="button" className="text-primary font-medium" onClick={() => setMode("signin")}>Entrar</button>
              </>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}
