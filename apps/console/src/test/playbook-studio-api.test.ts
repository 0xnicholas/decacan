import { beforeEach, describe, expect, it, vi } from 'vitest';

import { playbookApi } from '@/features/playbook-studio/api/playbookApi';

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

describe('playbookApi', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('loads real playbooks from the backend instead of mock data', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            handle: { playbook_handle_id: 'handle-1', title: 'Summary' },
            draft: {
              draft_id: 'draft-1',
              playbook_handle_id: 'handle-1',
              spec_document: 'metadata: {}',
              validation_state: 'valid',
            },
            latest_version: null,
            publishable: true,
          },
        ]),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const result = await playbookApi.listPlaybooks();

    expect(fetchMock).toHaveBeenCalledWith('/api/studio/playbooks', expect.anything());
    expect(result[0]?.name).toBe('Summary');
  });
});
