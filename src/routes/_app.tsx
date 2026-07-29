import { createFileRoute, Navigate } from "@tanstack/react-router";
import { DataProvider } from "@/context/DataContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="h-10 w-10 rounded-full animate-pulse"
          style={{ background: "linear-gradient(135deg, #7c3aed, #eab308)" }}
        />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <DataProvider>
      <DashboardLayout />
    </DataProvider>
  );
}
