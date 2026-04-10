import { describe, expect, it } from 'vitest';

import { MENU_SIDEBAR, MENU_SIDEBAR_COMPACT } from '../config/menu.config';

function getMenuItemByTitle(items: typeof MENU_SIDEBAR, title: string) {
  return items.find((item) => item.title === title);
}

function getMenuTitles(itemTitle: string) {
  return getMenuItemByTitle(MENU_SIDEBAR, itemTitle)?.children?.map((item) => item.title);
}

describe('menu.config', () => {
  it('keeps compact navigation on the canonical dashboard default', () => {
    expect(getMenuItemByTitle(MENU_SIDEBAR_COMPACT, 'Console')).toMatchObject({
      title: 'Console',
      path: '/dashboard/analytics',
    });
  });

  it('locks the four top-level console domains and their stable left-nav entries', () => {
    const domainTitles = MENU_SIDEBAR.filter((item) => item.title).map((item) => item.title);

    expect(domainTitles).toEqual(['Workspaces', 'Agents', 'Dashboard', 'Manage']);

    expect(getMenuTitles('Workspaces')).toEqual([
      'Workbench',
      'All Workspaces',
      'Approvals',
      'Runs',
      'Members',
    ]);
    expect(getMenuTitles('Agents')).toEqual([
      'Quickstart',
      'All Agents',
      'Playbooks',
      'Teams',
      'Capabilities',
      'Policies',
    ]);
    expect(getMenuTitles('Dashboard')).toEqual(['Analytics', 'My Work', 'Attention']);
    expect(getMenuTitles('Manage')).toEqual(['Account', 'Users', 'Audit Logs', 'Integrations', 'Settings']);

    const leftNavTitles = MENU_SIDEBAR.flatMap((item) => [
      item.title,
      ...(item.children?.map((child) => child.title) ?? []),
    ]).filter((title): title is string => Boolean(title));

    expect(leftNavTitles).not.toContain('Create Agent');
    expect(leftNavTitles).not.toContain('Agent Detail');
    expect(leftNavTitles).not.toContain('Edit Agent');
  });
});
