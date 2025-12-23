import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/register", "routes/register.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/routes", "routes/routes-list.tsx"),
  route("/routes/:id", "routes/route-details.tsx"),
  route("/bookings", "routes/bookings.tsx"),
  route("/tracking", "routes/tracking.tsx"),
  route("/profile", "routes/profile.tsx"),
] satisfies RouteConfig;

