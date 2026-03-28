import { useEffect, useState } from "react";

import { LaunchPage } from "../features/launch/LaunchPage";

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  return pathname;
}

export function AppRouter() {
  const pathname = usePathname();

  if (pathname.startsWith("/tasks/")) {
    return (
      <main className="task-route-placeholder">
        <p className="eyebrow">Decacan</p>
        <h1>Task workspace</h1>
        <p className="subcopy">Task detail UI lands in the next slice.</p>
      </main>
    );
  }

  return <LaunchPage />;
}
