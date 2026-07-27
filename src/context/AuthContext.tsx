import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);
const KEY = "sgv_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    // Mock auth — replace with `await api.post('/auth/login', {...})` later.
    await new Promise((r) => setTimeout(r, 400));
    const u: User = { id: "1", nome: email.split("@")[0] || "Usuário", email };
    window.localStorage.setItem(KEY, JSON.stringify(u));
    window.localStorage.setItem("auth_token", "mock-token");
    setUser(u);
  };

  const logout = () => {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
