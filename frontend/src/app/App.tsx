import "./styles.css";

import { AppProviders } from "./providers";
import { AppRouter } from "./router";

export function App() {
  return (
    <AppProviders>
      <div className="app-root">
        <AppRouter />
      </div>
    </AppProviders>
  );
}
