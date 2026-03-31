import { useAuth } from '../auth/AuthContext';

export function useAuthenticatedClient() {
  const { getAccessToken } = useAuth();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAccessToken();
    
    const headers = {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

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
  };

  return { fetchWithAuth };
}
