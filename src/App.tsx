import {
  AppShell,
  HelloWorldPage,
  createMessageApi,
} from "@yutakax17/advanced-hello-world-fe-core";
import "@yutakax17/advanced-hello-world-fe-core/styles.css";

const api = createMessageApi(import.meta.env.VITE_API_BASE_URL ?? "/api");

export function App() {
  return (
    <AppShell>
      <HelloWorldPage api={api} />
    </AppShell>
  );
}
