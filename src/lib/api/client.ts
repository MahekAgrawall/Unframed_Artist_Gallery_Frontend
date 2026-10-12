/**
 * Centralized HTTP client for the Spring Boot REST API.
 *
 * Base URL defaults to http://localhost:8081 for local development and can be
 * overridden with VITE_API_BASE_URL. The JWT returned by /api/users/login is
 * stored on the client and attached to every authenticated request.
 */

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8081";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const TOKEN_KEY = "unframed.auth.token";
export const UNAUTHORIZED_EVENT = "unframed:unauthorized";
export const TOKEN_CHANGED_EVENT = "unframed:token-changed";

export const authToken = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event(TOKEN_CHANGED_EVENT));
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(TOKEN_CHANGED_EVENT));
  },
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** Attach the stored JWT. Required endpoints set this to true. */
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const token = authToken.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.auth && !token) throw new ApiError(401, "You need to sign in to do that.");

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? null : JSON.stringify(options.body),
      signal: options.signal ?? null,
    });
  } catch {
    throw new ApiError(0, `Could not reach the server at ${API_BASE_URL}.`);
  }

  if (response.status === 401) {
    authToken.clear();
    if (typeof window !== "undefined") window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { message?: string; error?: string };
      if (data?.message) message = data.message;
      else if (data?.error) message = data.error;
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
