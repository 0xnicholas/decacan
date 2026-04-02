type ConsoleEnv = Record<string, string | undefined>;

export function resolveConsoleUrl(env: ConsoleEnv): string {
  return env["VITE_CONSOLE_URL"] ?? env["VITE_ACCOUNT_HUB_URL"] ?? "http://localhost:3001";
}

export const accountHubUrl = resolveConsoleUrl(import.meta.env);
