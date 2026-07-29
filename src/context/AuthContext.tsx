import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "@/types";

interface AuthCtx {
  user: User | null;
  session: null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

// Minimal stubbed AuthProvider: provides a default user so UI keeps working
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User | null>({ id: "local", nome: "Usuário", email: "" });
  const [loading] = useState(false);

  const signIn = async () => ({ error: null as Error | null });
  const signUp = async () => ({ error: null as Error | null });
  const signOut = async () => {};

  return (
    <AuthContext.Provider value={{ user, session: null, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
