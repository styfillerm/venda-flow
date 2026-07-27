import { createFileRoute } from "@tanstack/react-router";
import { DataProvider } from "@/context/DataContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <DataProvider>
      <DashboardLayout />
    </DataProvider>
  );
}
