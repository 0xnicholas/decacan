import { useEffect, useState } from "react";

import { LaunchPage } from "../features/launch/LaunchPage";
import { TaskPage } from "../features/task-detail/TaskPage";

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
    const taskId = pathname.split("/").at(-1);

    if (!taskId) {
      return null;
    }

    return <TaskPage taskId={taskId} />;
  }

  return <LaunchPage />;
}
