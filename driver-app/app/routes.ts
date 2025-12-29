import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("route", "routes/route.tsx"),
  route("bus", "routes/bus.tsx"),
  route("profile", "routes/profile.tsx"),
  route("notifications", "routes/notifications.tsx"),
  route("trips", "routes/trips.tsx"),
  route("trip/history", "routes/trip/history.tsx"),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;



