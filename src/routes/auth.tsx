import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

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
  usuario: z.string().min(1, "Informe o usuário"),
  password: z.string().min(1, "Informe a senha"),
});

const USUARIO = "podgyn";
const SENHA = "@@PodGYN@2026";
const EMAIL = "podgyn@podgyn.app";

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [loading, navigate, user]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    const parsed = credentialsSchema.safeParse({ usuario, password });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Verifique os dados informados");
      return;
    }
    if (parsed.data.usuario.trim().toLowerCase() !== USUARIO || parsed.data.password !== SENHA) {
      setMessage("Usuário ou senha inválidos.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signIn(EMAIL, SENHA);
      if (result.error) {
        const created = await signUp(EMAIL, SENHA, "PodGYN");
        if (created.error) {
          setMessage(errorMessage(created.error));
          return;
        }
        const retry = await signIn(EMAIL, SENHA);
        if (retry.error) setMessage(errorMessage(retry.error));
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "linear-gradient(160deg, var(--purple) 0%, var(--gold) 100%)" }}
    >
      <Card className="w-full max-w-md bg-card">
        <CardHeader>
          <CardTitle className="text-2xl">PodGYN</CardTitle>
          <CardDescription>Entre para acessar o painel</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">Usuário</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
            </div>
            {message && <p className="text-sm text-destructive" role="alert">{message}</p>}
            <Button className="w-full" type="submit" disabled={submitting || loading}>
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
