"use client";

import * as React from "react";

const ThemeProviderContext = React.createContext<
  | {
      theme: string;
      resolvedTheme: "light" | "dark";
      setTheme: (theme: string) => void;
    }
  | undefined
>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}) {
  const [theme, setTheme] = React.useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(storageKey) || defaultTheme
      : defaultTheme
  );

  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    let resolved: "light" | "dark";
    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      resolved = theme as "light" | "dark";
    }

    root.classList.add(resolved);
    setResolvedTheme(resolved);
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: string) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
