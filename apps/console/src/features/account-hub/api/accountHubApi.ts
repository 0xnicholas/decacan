import { getJson } from '@/shared/api/client';
import type { AccountHome } from '../types/accountHub.types';

export const accountHubApi = {
  getHome(signal?: AbortSignal) {
    return getJson<AccountHome>('/api/account/home', { signal });
  },
};
