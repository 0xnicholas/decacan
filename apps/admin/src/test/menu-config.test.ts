import { describe, expect, it } from 'vitest';

import { MENU_SIDEBAR, MENU_SIDEBAR_COMPACT } from '../config/menu.config';

describe('menu.config', () => {
  it('labels the account surface as Console in both navigation variants', () => {
    expect(MENU_SIDEBAR[1]).toMatchObject({
      title: 'Console',
      path: '/',
    });
    expect(MENU_SIDEBAR_COMPACT[0]).toMatchObject({
      title: 'Console',
      path: '/',
    });
  });
});
