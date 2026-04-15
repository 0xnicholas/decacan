import { AppProviders } from "./providers";
import { AppRouter } from "./router";

export function App() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-background text-foreground">
        <AppRouter />
      </div>
    </AppProviders>
  );
}
