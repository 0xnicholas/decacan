import type { ConsoleDomainId } from './console-nav';

export const consoleRouteDefaults: Record<ConsoleDomainId, string> = {
  workspaces: '/workspaces/workbench',
  agents: '/agents/quickstart',
  dashboard: '/dashboard/analytics',
  manage: '/manage/account',
};

export const agentContentRoutes = {
  create: '/agents/new',
  detail: '/agents/:agentId',
} as const;

export function getConsoleDefaultRoute(domainId: ConsoleDomainId) {
  return consoleRouteDefaults[domainId];
}
