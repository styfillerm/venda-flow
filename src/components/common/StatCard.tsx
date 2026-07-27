import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
}

const tones = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  danger: "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  neutral: "bg-muted text-muted-foreground",
};

export function StatCard({ title, value, icon: Icon, trend, tone = "primary" }: Props) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground truncate">{value}</p>
            {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
