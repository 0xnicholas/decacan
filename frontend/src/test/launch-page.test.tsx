import { render, screen } from "@testing-library/react";

import { App } from "../app/App";

describe("App", () => {
  it("renders the launch shell heading", async () => {
    render(<App />);

    expect(await screen.findByText("Choose a playbook")).toBeInTheDocument();
  });
});
