import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("api/test-connection", "routes/api/test-connection.ts"),
] satisfies RouteConfig;
