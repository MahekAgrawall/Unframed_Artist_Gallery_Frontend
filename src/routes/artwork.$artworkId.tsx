import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2 } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ApiNotice } from "@/components/ApiNotice";
import { artworksApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/artwork/$artworkId")({
  head: () => ({
    meta: [
      { title: "Artwork — Unframed" },
      { name: "description", content: "View an artwork on Unframed: full image, artist notes, likes and comments." },
      { property: "og:title", content: "Artwork — Unframed" },
      { property: "og:description", content: "View an artwork, its artist and the conversation around it." },
    ],
  }),
  component: ArtworkDetail,
});

function ArtworkDetail() {
  const { artworkId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const artworkQuery = useQuery({
    queryKey: ["artwork", artworkId],
    queryFn: ({ signal }) => artworksApi.getArtwork(artworkId, signal),
  });

  const likesQuery = useQuery({
    queryKey: ["artwork", artworkId, "likes"],
    queryFn: ({ signal }) => artworksApi.getLikes(artworkId, signal),
  });

  const commentsQuery = useQuery({
    queryKey: ["artwork", artworkId, "comments"],
    queryFn: ({ signal }) => artworksApi.listComments(artworkId, signal),
  });

  const likeMutation = useMutation({
    mutationFn: () => artworksApi.toggleLike(artworkId),
    onSuccess: () => {
      setNotice(null);
      void queryClient.invalidateQueries({ queryKey: ["artwork", artworkId] });
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : "Could not save your like."),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => artworksApi.addComment(artworkId, content),
    onSuccess: () => {
      setDraft("");
      setNotice(null);
      void queryClient.invalidateQueries({ queryKey: ["artwork", artworkId, "comments"] });
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : "Could not post your comment."),
  });

  const deleteMutation = useMutation({
    mutationFn: () => artworksApi.deleteArtwork(artworkId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void navigate({ to: "/feed" });
    },
    onError: (e) => setNotice(e instanceof Error ? e.message : "Could not delete this artwork."),
  });

  if (artworkQuery.isPending) {
    return <p className="py-32 text-center text-muted-foreground">Loading artwork…</p>;
  }

  if (artworkQuery.error || !artworkQuery.data) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32">
        <ApiNotice
          message={
            artworkQuery.error instanceof Error
              ? artworkQuery.error.message
              : "This artwork could not be loaded."
          }
        />
      </div>
    );
  }

  const artwork = artworkQuery.data;
  const comments = commentsQuery.data ?? [];
  const likeCount = likesQuery.data ?? artwork.likeCount;
  const isOwner = Boolean(user && artwork.artist.id && user.id === artwork.artist.id);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10 md:py-20">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="frame p-3 hover:translate-y-0 hover:shadow-frame">
          <img src={artwork.imageUrl} alt={artwork.title} className="w-full bg-canvas object-contain" />
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          {(artwork.medium || artwork.year) && (
            <p className="eyebrow">{[artwork.medium, artwork.year].filter(Boolean).join(" · ")}</p>
          )}
          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">{artwork.title}</h1>

          {artwork.artist.id ? (
            <Link
              to="/artists/$userId"
              params={{ userId: artwork.artist.id }}
              className="mt-6 flex items-center gap-3 border-y border-border py-4 transition-colors hover:text-accent"
            >
              <Avatar name={artwork.artist.name} src={artwork.artist.profileImageUrl} size="md" />
              <span className="block text-lg font-display">{artwork.artist.name}</span>
            </Link>
          ) : (
            <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
              <Avatar name={artwork.artist.name} src={artwork.artist.profileImageUrl} size="md" />
              <span className="block text-lg font-display">{artwork.artist.name}</span>
            </div>
          )}

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{artwork.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={artwork.likedByMe ? "btn-ink" : "btn-outline"}
              aria-pressed={Boolean(artwork.likedByMe)}
            >
              <Heart
                className="h-4 w-4"
                strokeWidth={1.5}
                fill={artwork.likedByMe ? "currentColor" : "none"}
              />
              {likeCount}
            </button>
            <span className="eyebrow">{comments.length} comments</span>
            {isOwner && (
              <>
                <Link to="/artwork/$artworkId/edit" params={{ artworkId }} className="btn-outline">
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="btn-outline"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  Delete
                </button>
              </>
            )}
          </div>

          {notice && (
            <div className="mt-5">
              <ApiNotice message={notice} />
            </div>
          )}

          <section id="comments" className="mt-12">
            <h2 className="border-b border-border pb-3 text-2xl">Comments</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) commentMutation.mutate(draft.trim());
              }}
              className="mt-6 flex items-end gap-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Leave a note for the artist"
                aria-label="Write a comment"
                className="field"
              />
              <button type="submit" disabled={commentMutation.isPending} className="btn-ink shrink-0">
                Post
              </button>
            </form>

            <ul className="mt-8 space-y-7">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-4">
                  <Avatar name={c.author.name} src={c.author.profileImageUrl} />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{c.author.name}</span>{" "}
                      {c.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.content}</p>
                  </div>
                </li>
              ))}
              {comments.length === 0 && (
                <li className="text-sm text-muted-foreground">No comments yet. Be the first.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
