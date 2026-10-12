/**
 * Domain models shared by the UI and the API layer.
 * These mirror the payloads returned by the Spring Boot REST API.
 */

export interface Artist {
  id: string;
  name: string;
  bio: string;
  profileImageUrl: string;
  location?: string | undefined;
  followerCount?: number | undefined;
  followingCount?: number | undefined;
  isFollowing?: boolean | undefined;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  medium?: string | undefined;
  year?: string | undefined;
  artist: Artist;
  likeCount: number;
  commentCount: number;
  likedByMe?: boolean | undefined;
  createdAt?: string | undefined;
}

export interface Comment {
  id: string;
  artworkId?: string | undefined;
  author: Artist;
  content: string;
  createdAt?: string | undefined;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  bio: string;
  profileImageUrl: string;
}

export interface AuthTokenResponse {
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface CreateArtworkPayload {
  title: string;
  description: string;
  imageUrl: string;
}

export interface UpdateProfilePayload {
  name: string;
  bio: string;
  profileImageUrl: string;
}
