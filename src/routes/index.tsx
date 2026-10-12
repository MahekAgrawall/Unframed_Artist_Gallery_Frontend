import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArtworkCard } from "@/components/ArtworkCard";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Avatar } from "@/components/Avatar";
import { artworksApi } from "@/lib/api";
import type { Artist } from "@/lib/api/types";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unframed — A Gallery for Working Artists" },
      {
        name: "description",
        content:
          "Unframed is where artists show work, follow each other and talk about craft. Publish a piece, build a portfolio, find your people.",
      },
      { property: "og:title", content: "Unframed — A Gallery for Working Artists" },
      {
        property: "og:description",
        content: "Publish artwork, build a portfolio and discover artists on Unframed.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { data } = useQuery({
    queryKey: ["artworks", "public"],
    queryFn: ({ signal }) => artworksApi.listArtworks(signal),
  });

  const artworks = data ?? [];
  const featured = artworks.slice(0, 3);

  const artists: Artist[] = [];
  for (const artwork of artworks) {
    if (artwork.artist.id && !artists.some((a) => a.id === artwork.artist.id)) {
      artists.push(artwork.artist);
    }
    if (artists.length === 3) break;
  }

  return (
    <div>
      <section className="mx-auto max-w-[1400px] px-6 pt-16 pb-20 md:px-10 md:pt-28">
        <p className="eyebrow">An open gallery, est. 2026</p>
        <h1 className="mt-6 max-w-4xl text-5xl leading-[1.02] md:text-7xl lg:text-8xl">
          Work deserves a wall
          <span className="block italic text-accent">before it deserves an algorithm.</span>
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
          Unframed is a quiet, generous place for artists to show what they are making — paintings,
          drawings, prints, photographs — and to find the people making the next thing.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/feed" className="btn-ink">
            Enter the gallery
          </Link>
          <Link to="/register" className="btn-outline">
            Create a portfolio
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-canvas">
        <img
          src={hero}
          alt="A large abstract canvas hanging in a sunlit gallery"
          width={1600}
          height={1008}
          className="h-[42vh] w-full object-cover md:h-[68vh]"
        />
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-28">
        <div className="flex items-baseline justify-between border-b border-border pb-6">
          <h2 className="text-3xl md:text-4xl">Currently on view</h2>
          <Link to="/feed" className="eyebrow hover:text-accent">
            All work
          </Link>
        </div>
        <div className="mt-12">
          {featured.length === 0 ? (
            <p className="py-10 text-muted-foreground">No work published yet.</p>
          ) : (
            <MasonryGrid>
              {featured.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </MasonryGrid>
          )}
        </div>
      </section>

      {artists.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
          <div className="flex items-baseline justify-between border-b border-border pb-6">
            <h2 className="text-3xl md:text-4xl">Artists to follow</h2>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                to="/artists/$userId"
                params={{ userId: artist.id }}
                className="frame flex gap-5 p-6"
              >
                <Avatar name={artist.name} src={artist.profileImageUrl} size="md" />
                <div>
                  <h3 className="font-display text-2xl leading-none">{artist.name}</h3>
                  {artist.location && <p className="eyebrow mt-2">{artist.location}</p>}
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{artist.bio}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
