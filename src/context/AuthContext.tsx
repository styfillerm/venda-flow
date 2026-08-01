import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession?.user) {
      setUser(null);
      return;
    }

    const authUser = nextSession.user;
    const fallbackName = String(authUser.user_metadata?.nome ?? authUser.user_metadata?.full_name ?? authUser.email?.split("@")[0] ?? "Usuário");
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("nome")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) console.error("Falha ao carregar perfil:", error);
    if (!profile) {
      const { error: profileError } = await supabase.from("profiles").upsert({ id: authUser.id, nome: fallbackName });
      if (profileError) console.error("Falha ao criar perfil:", profileError);
    }

    setUser({ id: authUser.id, nome: profile?.nome || fallbackName, email: authUser.email ?? "" });
  }, []);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error) console.error("Falha ao recuperar sessão:", error);
      await syncUser(data.session);
      if (active) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      void syncUser(nextSession).finally(() => active && setLoading(false));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [syncUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, nome?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { nome: nome?.trim() || email.split("@")[0] } },
    });
    if (!error && data.session) await syncUser(data.session);
    return { error: error ? new Error(error.message) : null };
  }, [syncUser]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, session, loading, signIn, signUp, signOut }), [user, session, loading, signIn, signUp, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
