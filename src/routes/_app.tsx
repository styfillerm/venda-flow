import { createFileRoute, redirect } from "@tanstack/react-router";
import { DataProvider } from "@/context/DataContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <DataProvider>
      <DashboardLayout />
    </DataProvider>
  );
}
