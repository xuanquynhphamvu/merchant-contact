import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("customers", "routes/customers.tsx"),
    route("customers/new", "routes/customers.new.tsx"),
    route("customers/:id", "routes/customers.$id.tsx"),
    route("api/test-connection", "routes/api/test-connection.ts"),
] satisfies RouteConfig;
