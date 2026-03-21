export class HttpResponseError extends Error {
  status: number;
  responseJSON?: unknown;

  constructor(status: number, responseJSON?: unknown) {
    super(`HTTP error: ${status}`);
    this.name = "HttpResponseError";
    this.status = status;
    this.responseJSON = responseJSON;
  }
}

async function readResponseJSON(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined;
  }

  return response.json();
}

async function throwForNonOkResponse(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  throw new HttpResponseError(response.status, await readResponseJSON(response));
}

export async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  return response.arrayBuffer();
}

export async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  await throwForNonOkResponse(response);
  return response.json() as Promise<T>;
}

export async function sendFile<T>(url: string, file: File): Promise<T> {
  const response = await fetch(url, {
    body: file,
    headers: { "Content-Type": "application/octet-stream" },
    method: "POST",
  });
  await throwForNonOkResponse(response);
  return response.json() as Promise<T>;
}

export async function sendJSON<T>(url: string, data: object): Promise<T> {
  const response = await fetch(url, {
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  await throwForNonOkResponse(response);
  return response.json() as Promise<T>;
}
