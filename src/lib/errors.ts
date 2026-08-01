import { toast } from "sonner";

/** Extrai uma mensagem legível de qualquer erro (Supabase, Error, string). */
export function errorMessage(e: unknown): string {
  if (!e) return "Erro desconhecido";
  if (typeof e === "string") return e;
  const anyE = e as { message?: string; details?: string; hint?: string; code?: string };
  return [anyE.message, anyE.details, anyE.hint, anyE.code ? `Código: ${anyE.code}` : ""]
    .filter(Boolean)
    .join(" — ") || "Erro desconhecido";
}

/** Executa uma ação assíncrona exibindo toast de sucesso ou de erro. */
export async function runAction(fn: () => Promise<void>, success?: string): Promise<boolean> {
  try {
    await fn();
    if (success) toast.success(success);
    return true;
  } catch (e) {
    console.error(e);
    toast.error(errorMessage(e));
    return false;
  }
}
