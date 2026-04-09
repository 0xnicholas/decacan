import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@decacan/ui";

import { App } from "../app/App";
import { IndustryProvider } from "../app/providers/index";

export function renderAppAtRoute(route?: string) {
  const resolvedRoute =
    route ??
    (`${window.location.pathname}${window.location.search}${window.location.hash}` || "/");

  window.history.replaceState(window.history.state ?? {}, "", resolvedRoute);

  return render(
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      <BrowserRouter>
        <IndustryProvider>
          <App />
        </IndustryProvider>
      </BrowserRouter>
    </ThemeProvider>,
  );
}
