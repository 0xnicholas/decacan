export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function postJson<TRequest, TResponse>(
  path: string,
  body: TRequest,
): Promise<TResponse> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`POST ${path} failed with ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export async function putJson<TRequest, TResponse>(
  path: string,
  body: TRequest,
): Promise<TResponse> {
  const response = await fetch(path, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`PUT ${path} failed with ${response.status}`);
  }

  return (await response.json()) as TResponse;
}
