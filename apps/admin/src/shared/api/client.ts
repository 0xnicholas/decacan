async function requestJson<T>(input: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  const response = await fetch(input, { ...init, headers });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function withJsonBody<T>(body: T, init: RequestInit): RequestInit {
  if (body === undefined) {
    return init;
  }

  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');

  return {
    ...init,
    headers,
    body: JSON.stringify(body),
  };
}

export function getJson<T>(input: string, init: RequestInit = {}): Promise<T> {
  return requestJson<T>(input, { ...init, method: init.method ?? 'GET' });
}

export function postJson<TRequest, TResponse>(
  input: string,
  body?: TRequest,
  init: RequestInit = {},
): Promise<TResponse> {
  return requestJson<TResponse>(input, withJsonBody(body, { ...init, method: 'POST' }));
}

export function putJson<TRequest, TResponse>(
  input: string,
  body: TRequest,
  init: RequestInit = {},
): Promise<TResponse> {
  return requestJson<TResponse>(input, withJsonBody(body, { ...init, method: 'PUT' }));
}

export function deleteJson<TResponse>(input: string, init: RequestInit = {}): Promise<TResponse> {
  return requestJson<TResponse>(input, { ...init, method: 'DELETE' });
}
