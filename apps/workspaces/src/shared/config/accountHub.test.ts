import { describe, expect, it } from "vitest";

import { resolveConsoleUrl } from "./accountHub";

describe("resolveConsoleUrl", () => {
  it("prefers VITE_CONSOLE_URL when both variables are present", () => {
    expect(
      resolveConsoleUrl({
        VITE_CONSOLE_URL: "http://localhost:4001",
        VITE_ACCOUNT_HUB_URL: "http://localhost:3001",
      }),
    ).toBe("http://localhost:4001");
  });

  it("falls back to VITE_ACCOUNT_HUB_URL when VITE_CONSOLE_URL is absent", () => {
    expect(
      resolveConsoleUrl({
        VITE_ACCOUNT_HUB_URL: "http://localhost:3001",
      }),
    ).toBe("http://localhost:3001");
  });

  it("uses the default local console URL when neither variable is configured", () => {
    expect(resolveConsoleUrl({})).toBe("http://localhost:3001");
  });
});
