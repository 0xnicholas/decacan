import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { App } from "../app/App";

export function renderAppAtRoute(route?: string) {
  const resolvedRoute =
    route ??
    (`${window.location.pathname}${window.location.search}${window.location.hash}` || "/");

  window.history.replaceState({}, "", resolvedRoute);

  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
