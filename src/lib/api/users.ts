import { apiRequest, authToken } from "./client";
import { toAuthUser } from "./normalize";
import type {
  AuthTokenResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from "./types";

/** POST /api/users/login — stores the returned JWT. */
export async function login(payload: LoginPayload): Promise<string> {
  const data = await apiRequest<AuthTokenResponse>("/api/users/login", {
    method: "POST",
    body: payload,
  });
  const token = typeof data === "string" ? data : data?.token;
  if (!token) throw new Error("The server did not return a token.");
  authToken.set(token);
  return token;
}

/** POST /api/users/register */
export async function register(payload: RegisterPayload): Promise<string | null> {
  const data = await apiRequest<AuthTokenResponse | undefined>("/api/users/register", {
    method: "POST",
    body: payload,
  });
  const token = typeof data === "string" ? data : data?.token;
  if (token) {
    authToken.set(token);
    return token;
  }
  return null;
}

/** GET /api/users/me */
export const getMe = async (signal?: AbortSignal): Promise<AuthUser> =>
  toAuthUser(await apiRequest<unknown>("/api/users/me", { auth: true, ...(signal ? { signal } : {}) }));

/** PUT /api/users/me */
export const updateMe = async (payload: UpdateProfilePayload): Promise<AuthUser> =>
  toAuthUser(await apiRequest<unknown>("/api/users/me", { method: "PUT", body: payload, auth: true }));

/** DELETE /api/users/me */
export const deleteMe = () => apiRequest<void>("/api/users/me", { method: "DELETE", auth: true });

/** POST /api/users/{userId}/follow */
export const followUser = (userId: string) =>
  apiRequest<unknown>(`/api/users/${userId}/follow`, { method: "POST", auth: true });

export function logout() {
  authToken.clear();
}
