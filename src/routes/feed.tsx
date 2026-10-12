import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ArtworkCard } from "@/components/ArtworkCard";
import { MasonryGrid } from "@/components/MasonryGrid";
import { ApiNotice } from "@/components/ApiNotice";
import { artworksApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type FeedSearch = { q?: string | undefined };

export const Route = createFileRoute("/feed")({
  validateSearch: (search: Record<string, unknown>): FeedSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Feed — Unframed" },
      { name: "description", content: "New paintings, drawings, prints and photographs from artists on Unframed." },
      { property: "og:title", content: "Feed — Unframed" },
      { property: "og:description", content: "New work from artists on Unframed." },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [query, setQuery] = useState(q ?? "");

  useEffect(() => setQuery(q ?? ""), [q]);

  const term = (q ?? "").trim();

  const { data, isPending, error } = useQuery({
    queryKey: ["feed", term, isAuthenticated],
    enabled: !loading,
    queryFn: ({ signal }) =>
      term
        ? artworksApi.searchArtworks(term, signal)
        : isAuthenticated
          ? artworksApi.getFeed(signal)
          : artworksApi.listArtworks(signal),
  });

  const results = data ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
      <div className="flex flex-col gap-8 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Latest work</p>
          <h1 className="mt-3 text-4xl md:text-6xl">The Feed</h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ search: { q: query.trim() || undefined } });
          }}
          className="flex w-full items-center gap-3 md:w-80"
        >
          <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, artists, media"
            aria-label="Search artwork"
            className="field"
          />
        </form>
      </div>

      {error && (
        <div className="mt-8 max-w-2xl">
          <ApiNotice message={error instanceof Error ? error.message : "Could not load the feed."} />
        </div>
      )}

      {!loading && !isAuthenticated && !term && (
        <div className="mt-8 max-w-2xl">
          <ApiNotice message="Showing all public work. Sign in for a feed built from the artists you follow." />
        </div>
      )}

      {isPending ? (
        <p className="py-24 text-center text-muted-foreground">Loading work…</p>
      ) : results.length === 0 ? (
        <p className="py-24 text-center text-muted-foreground">
          {term ? `Nothing matches “${term}”. Try a different word.` : "No artwork published yet."}{" "}
          <Link to="/create" className="underline underline-offset-4">
            Publish a piece
          </Link>
        </p>
      ) : (
        <div className="mt-12">
          <MasonryGrid>
            {results.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </MasonryGrid>
        </div>
      )}
    </div>
  );
}
