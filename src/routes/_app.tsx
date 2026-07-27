import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <DashboardLayout />
      </DataProvider>
    </AuthProvider>
  );
}
