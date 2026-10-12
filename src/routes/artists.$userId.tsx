import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/Avatar";
import { ArtworkCard } from "@/components/ArtworkCard";
import { MasonryGrid } from "@/components/MasonryGrid";
import { ApiNotice } from "@/components/ApiNotice";
import { artworksApi, usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/artists/$userId")({
  head: () => ({
    meta: [
      { title: "Artist — Unframed" },
      { name: "description", content: "An artist's portfolio on Unframed: bio, followers and published work." },
      { property: "og:title", content: "Artist — Unframed" },
      { property: "og:description", content: "An artist's portfolio on Unframed." },
    ],
  }),
  component: ArtistProfile,
});

function ArtistProfile() {
  const { userId } = Route.useParams();
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["artworks", "public"],
    queryFn: ({ signal }) => artworksApi.listArtworks(signal),
  });

  const followMutation = useMutation({
    mutationFn: () => usersApi.followUser(userId),
    onSuccess: () => {
      setFollowing((v) => !v);
      setNotice(null);
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : "Could not update your follow."),
  });

  const artworks = (data ?? []).filter((a) => a.artist.id === userId);
  const artist = artworks[0]?.artist;
  const isMe = user?.id === userId;

  if (isPending) return <p className="py-32 text-center text-muted-foreground">Loading profile…</p>;

  if (error || !artist) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32">
        <ApiNotice
          message={
            error instanceof Error ? error.message : "This artist has no published work yet."
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
      <header className="flex flex-col gap-8 border-b border-border pb-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <Avatar name={artist.name} src={artist.profileImageUrl} size="lg" />
          <div>
            {artist.location && <p className="eyebrow">{artist.location}</p>}
            <h1 className="mt-2 text-5xl md:text-6xl">{artist.name}</h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">{artist.bio}</p>
            <div className="mt-5 flex gap-8 text-xs tracking-[0.16em] text-muted-foreground uppercase">
              <span>{artworks.length} works</span>
              <span>{(artist.followerCount ?? 0).toLocaleString()} followers</span>
              <span>{artist.followingCount ?? 0} following</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {!isMe && (
            <button
              type="button"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={following || artist.isFollowing ? "btn-ink" : "btn-outline"}
            >
              {following || artist.isFollowing ? "Following" : "Follow"}
            </button>
          )}
          {isMe && (
            <Link to="/profile/edit" className="btn-outline">
              Edit profile
            </Link>
          )}
        </div>
      </header>

      {notice && (
        <div className="mt-8 max-w-md">
          <ApiNotice message={notice} />
        </div>
      )}

      <div className="mt-14">
        <MasonryGrid>
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </MasonryGrid>
      </div>
    </div>
  );
}
