import { apiRequest } from "./client";
import { toArtwork, toComment, toList } from "./normalize";
import type { Artwork, Comment, CreateArtworkPayload } from "./types";

/** GET /api/artworks — public listing. */
export const listArtworks = async (signal?: AbortSignal): Promise<Artwork[]> =>
  toList(await apiRequest<unknown>("/api/artworks", { ...(signal ? { signal } : {}) })).map(toArtwork);

/** GET /api/feed — authenticated personalised feed. */
export const getFeed = async (signal?: AbortSignal): Promise<Artwork[]> =>
  toList(await apiRequest<unknown>("/api/feed", { auth: true, ...(signal ? { signal } : {}) })).map(
    toArtwork,
  );

/** GET /api/artworks/search?query= */
export const searchArtworks = async (query: string, signal?: AbortSignal): Promise<Artwork[]> =>
  toList(
    await apiRequest<unknown>(`/api/artworks/search?query=${encodeURIComponent(query)}`, {
      ...(signal ? { signal } : {}),
    }),
  ).map(toArtwork);

/** GET /api/artworks/{id} */
export const getArtwork = async (id: string, signal?: AbortSignal): Promise<Artwork> =>
  toArtwork(await apiRequest<unknown>(`/api/artworks/${id}`, { ...(signal ? { signal } : {}) }));

/** POST /api/artworks */
export const createArtwork = async (payload: CreateArtworkPayload): Promise<Artwork> =>
  toArtwork(await apiRequest<unknown>("/api/artworks", { method: "POST", body: payload, auth: true }));

/** PUT /api/artworks/{id} */
export const updateArtwork = async (
  id: string,
  payload: CreateArtworkPayload,
): Promise<Artwork> =>
  toArtwork(
    await apiRequest<unknown>(`/api/artworks/${id}`, { method: "PUT", body: payload, auth: true }),
  );

/** DELETE /api/artworks/{id} */
export const deleteArtwork = (id: string) =>
  apiRequest<void>(`/api/artworks/${id}`, { method: "DELETE", auth: true });

/** GET /api/artworks/{id}/likes */
export const getLikes = async (id: string, signal?: AbortSignal): Promise<number> => {
  const raw = await apiRequest<unknown>(`/api/artworks/${id}/likes`, {
    ...(signal ? { signal } : {}),
  });
  if (typeof raw === "number") return raw;
  if (Array.isArray(raw)) return raw.length;
  const r = (raw ?? {}) as Record<string, unknown>;
  const count = r["likeCount"] ?? r["count"] ?? r["likes"];
  if (typeof count === "number") return count;
  if (Array.isArray(count)) return count.length;
  return 0;
};

/** POST /api/artworks/{id}/like — toggles the like for the signed-in user. */
export const toggleLike = (id: string) =>
  apiRequest<unknown>(`/api/artworks/${id}/like`, { method: "POST", auth: true });

/** GET /api/artworks/{id}/comments */
export const listComments = async (id: string, signal?: AbortSignal): Promise<Comment[]> =>
  toList(
    await apiRequest<unknown>(`/api/artworks/${id}/comments`, { ...(signal ? { signal } : {}) }),
  ).map(toComment);

/** POST /api/artworks/{id}/comments */
export const addComment = async (id: string, content: string): Promise<Comment> =>
  toComment(
    await apiRequest<unknown>(`/api/artworks/${id}/comments`, {
      method: "POST",
      body: { content },
      auth: true,
    }),
  );
