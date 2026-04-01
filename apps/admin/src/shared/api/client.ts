export async function getJson<T>(input: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  const response = await fetch(input, { ...init, headers });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
