import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { lovable } from "@/integrations/lovable";
import { errorMessage } from "@/lib/errors";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso — PodGYN" },
      { name: "description", content: "Acesse o sistema de gestão PodGYN." },
      { property: "og:title", content: "Acesso — PodGYN" },
      { property: "og:description", content: "Acesse o sistema de gestão PodGYN." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const credentialsSchema = z.object({
  email: z.string().email("Informe um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [loading, navigate, user]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Verifique os dados informados");
      return;
    }
    if (mode === "signup" && nome.trim().length < 2) {
      setMessage("Informe seu nome");
      return;
    }

    setSubmitting(true);
    try {
      const result = mode === "login"
        ? await signIn(parsed.data.email, parsed.data.password)
        : await signUp(parsed.data.email, parsed.data.password, nome);
      if (result.error) {
        setMessage(errorMessage(result.error));
        return;
      }
      if (mode === "signup") setMessage("Conta criada. Confirme seu email para entrar.");
    } finally {
      setSubmitting(false);
    }
  };

  const googleSignIn = async () => {
    setMessage("");
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) setMessage(errorMessage(result.error));
      if (!result.redirected && !result.error) await navigate({ to: "/dashboard", replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">PodGYN</CardTitle>
          <CardDescription>{mode === "login" ? "Entre para acessar o painel" : "Crie seu acesso ao sistema"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={submit}>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            </div>
            {message && <p className="text-sm text-destructive" role="alert">{message}</p>}
            <Button className="w-full" type="submit" disabled={submitting || loading}>
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
          <Button className="w-full" type="button" variant="outline" onClick={googleSignIn} disabled={submitting || loading}>
            Continuar com Google
          </Button>
          <Button className="w-full" type="button" variant="ghost" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
            {mode === "login" ? "Criar uma conta" : "Já tenho uma conta"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}