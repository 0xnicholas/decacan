import { Navigate, type RouteObject } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { routes } from '../app/routes';

function findRouteByPath(routeObjects: RouteObject[], path: string): RouteObject | undefined {
  for (const route of routeObjects) {
    if (route.path === path) {
      return route;
    }

    if (route.children) {
      const childRoute = findRouteByPath(route.children, path);
      if (childRoute) {
        return childRoute;
      }
    }
  }

  return undefined;
}

function expectRedirect(path: string, target: string) {
  const route = findRouteByPath(routes, path);

  expect(route, `route for ${path}`).toBeDefined();
  expect(route?.element).toMatchObject({
    type: Navigate,
    props: expect.objectContaining({
      to: target,
      replace: true,
    }),
  });
}

describe('console IA routing', () => {
  it.each([
    ['/workspaces', '/workspaces/workbench'],
    ['/agents', '/agents/quickstart'],
    ['/dashboard', '/dashboard/analytics'],
    ['/manage', '/manage/account'],
  ])('redirects %s to %s', (path, target) => {
    expectRedirect(path, target);
  });
});
