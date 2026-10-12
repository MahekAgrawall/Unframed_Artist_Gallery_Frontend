/**
 * Tolerant mappers from the Spring Boot payloads to the UI models.
 * Field names vary slightly between DTOs (user/artist/author, likes/likeCount),
 * so every mapper accepts the common variants.
 */
import type { Artist, Artwork, AuthUser, Comment } from "./types";

type Raw = Record<string, unknown>;

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : fallback;

const num = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") return value;
  if (Array.isArray(value)) return value.length;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value)))
    return Number(value);
  return fallback;
};

const bool = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

export function toArtist(raw: unknown): Artist {
  const r = (raw ?? {}) as Raw;
  return {
    id: str(r["id"] ?? r["userId"] ?? r["artistId"]),
    name: str(r["name"] ?? r["username"] ?? r["fullName"], "Unknown artist"),
    bio: str(r["bio"]),
    profileImageUrl: str(r["profileImageUrl"] ?? r["avatarUrl"] ?? r["imageUrl"]),
    location: str(r["location"]) || undefined,
    followerCount: num(r["followerCount"] ?? r["followersCount"] ?? r["followers"], 0),
    followingCount: num(r["followingCount"] ?? r["following"], 0),
    ...(bool(r["isFollowing"] ?? r["following"]) !== undefined
      ? { isFollowing: bool(r["isFollowing"] ?? r["following"]) }
      : {}),
  };
}

export function toArtwork(raw: unknown): Artwork {
  const r = (raw ?? {}) as Raw;

  const artistSource =
    r["artist"] ?? r["user"] ?? r["owner"] ?? r["author"] ?? {
      id: r["userId"] ?? r["artistId"],
      name: r["userName"] ?? r["artistName"] ?? r["authorName"],
    };

  const artist = toArtist(artistSource);

  if (!artist.id) {
    artist.id = str(r["userId"] ?? r["artistId"]);
  }

  return {
    id: str(r["id"] ?? r["artworkId"]),
    title: str(r["title"], "Untitled"),
    description: str(r["description"]),
    imageUrl: str(r["imageUrl"] ?? r["image"] ?? r["url"]),
    medium: str(r["medium"]) || undefined,
    year: str(r["year"]) || undefined,
    artist,
    likeCount: num(r["likeCount"] ?? r["likesCount"] ?? r["likes"], 0),
    commentCount: num(r["commentCount"] ?? r["commentsCount"] ?? r["comments"], 0),
    ...(bool(r["likedByMe"] ?? r["liked"]) !== undefined
      ? { likedByMe: bool(r["likedByMe"] ?? r["liked"]) }
      : {}),
    createdAt: str(r["createdAt"] ?? r["createdDate"]) || undefined,
  };
}


export function toComment(raw: unknown): Comment {
  const r = (raw ?? {}) as Raw;
  return {
    id: str(r["id"] ?? r["commentId"]),
    artworkId: str(r["artworkId"]) || undefined,
    author: toArtist(r["user"] ?? r["author"] ?? r["artist"] ?? {}),
    content: str(r["content"] ?? r["body"] ?? r["text"]),
    createdAt: str(r["createdAt"] ?? r["createdDate"]) || undefined,
  };
}

export function toAuthUser(raw: unknown): AuthUser {
  const r = (raw ?? {}) as Raw;
  return {
    id: str(r["id"] ?? r["userId"]),
    name: str(r["name"] ?? r["username"]),
    email: str(r["email"]),
    bio: str(r["bio"]),
    profileImageUrl: str(r["profileImageUrl"] ?? r["avatarUrl"]),
  };
}

/** Endpoints may return a bare array or a Spring Page object. */
export function toList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const r = (raw ?? {}) as Raw;
  if (Array.isArray(r["content"])) return r["content"];
  if (Array.isArray(r["items"])) return r["items"];
  if (Array.isArray(r["data"])) return r["data"];
  return [];
}
