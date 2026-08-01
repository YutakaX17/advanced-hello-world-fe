import { AppShell } from "@yutakax17/advanced-hello-world-fe-core";

import { moduleFactories } from "./generated-modules";

const context = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "/api",
};
const routes = moduleFactories.flatMap((factory) => factory(context).routes);

export function App() {
  const route = routes.find(({ path }) => path === window.location.pathname);

  return (
    <AppShell>{route ? <route.component /> : <h1>Page not found</h1>}</AppShell>
  );
}
