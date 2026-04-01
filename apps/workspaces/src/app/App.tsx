import { AppProviders } from "./providers";
import { AppRouter } from "./router";

export function App() {
  return (
    <AppProviders>
      <div className="min-h-screen">
        <AppRouter />
      </div>
    </AppProviders>
  );
}
