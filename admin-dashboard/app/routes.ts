import { type RouteConfig, index, route } from "@react-router/dev/routes";
import DashboardLayout from "./components/layouts/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login/route.tsx"),
  route("signup", "routes/signup/route.tsx"),
  route("forgot-password", "routes/forgot-password/route.tsx"),
  route("reset-password", "routes/reset-password/route.tsx"),
  route("dashboard", "routes/dashboard/route.tsx", {
    layout: DashboardLayout,
    beforeLoad: async ({ request }) => {
      // Protected route - will be handled by ProtectedRoute component
      return {};
    },
  }),
  route("buses", "routes/buses/route.tsx", {
    layout: DashboardLayout,
  }),
  route("buses/new", "routes/buses.new/route.tsx", {
    layout: DashboardLayout,
  }),
  // More specific route (edit) must come before less specific route (view)
  route("buses.$id.edit", "routes/buses.$id.edit/route.tsx", {
    layout: DashboardLayout,
  }),
  route("buses.$id", "routes/buses.$id/route.tsx", {
    layout: DashboardLayout,
  }),
  route("routes", "routes/routes/route.tsx", {
    layout: DashboardLayout,
  }),
  route("routes/new", "routes/routes.new/route.tsx", {
    layout: DashboardLayout,
  }),
  route("routes.$id", "routes/routes.$id/route.tsx", {
    layout: DashboardLayout,
  }),
  route("routes.$id.edit", "routes/routes.$id.edit/route.tsx", {
    layout: DashboardLayout,
  }),
  route("students", "routes/students/route.tsx", {
    layout: DashboardLayout,
  }),
  route("students.$id", "routes/students.$id/route.tsx", {
    layout: DashboardLayout,
  }),
  route("drivers", "routes/drivers/route.tsx", {
    layout: DashboardLayout,
  }),
  route("drivers.$id", "routes/drivers.$id/route.tsx", {
    layout: DashboardLayout,
  }),
  route("admins", "routes/admins/route.tsx", {
    layout: DashboardLayout,
  }),
  route("trips", "routes/trips/route.tsx", {
    layout: DashboardLayout,
  }),
  route("trips.$id", "routes/trips.$id/route.tsx", {
    layout: DashboardLayout,
  }),
  route("stops", "routes/stops/route.tsx", {
    layout: DashboardLayout,
  }),
  route("live-map", "routes/live-map/route.tsx", {
    layout: DashboardLayout,
  }),
  route("analytics", "routes/analytics/route.tsx", {
    layout: DashboardLayout,
  }),
  route("reports", "routes/reports/route.tsx", {
    layout: DashboardLayout,
  }),
  route("alerts", "routes/alerts/route.tsx", {
    layout: DashboardLayout,
  }),
  route("alerts.$id", "routes/alerts.$id/route.tsx", {
    layout: DashboardLayout,
  }),
  route("notifications/new", "routes/notifications.new/route.tsx", {
    layout: DashboardLayout,
  }),
  route("maintenance", "routes/maintenance/route.tsx", {
    layout: DashboardLayout,
  }),
  route("settings", "routes/settings/route.tsx", {
    layout: DashboardLayout,
  }),
] satisfies RouteConfig;
