import DashboardLayout from "../components/layouts/DashboardLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function AdminLayout() {
  return (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  );
}
