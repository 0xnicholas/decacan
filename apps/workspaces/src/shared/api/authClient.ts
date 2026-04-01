import { useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';

export function useAuthenticatedClient() {
  const { getAccessToken } = useAuth();

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = getAccessToken();
    
    // Use Headers API for proper header handling
    const headers = new Headers(options.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired, could trigger refresh here
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response;
  }, [getAccessToken]);

  return { fetchWithAuth };
}
