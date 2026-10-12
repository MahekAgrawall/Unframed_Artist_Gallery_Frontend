import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import type { Artwork } from "@/lib/api/types";
import fallbackArtwork from "@/assets/art-1.jpg";

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <article className="frame mb-8 break-inside-avoid p-3">
      <Link
        to="/artwork/$artworkId"
        params={{ artworkId: artwork.id }}
        className="block overflow-hidden bg-canvas"
      >
        <img
          src={artwork.imageUrl || fallbackArtwork}
          alt={artwork.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackArtwork;
          }}
          className="w-full transition-transform duration-700 ease-out hover:scale-[1.02]"
        />
      </Link>

      <div className="flex items-end justify-between gap-4 px-2 pt-4 pb-1">
        <div className="min-w-0">
          <Link to="/artwork/$artworkId" params={{ artworkId: artwork.id }}>
            <h3 className="truncate font-display text-xl leading-tight hover:text-accent">{artwork.title}</h3>
          </Link>
          {artwork.artist.id ? (
            <Link
              to="/artists/$userId"
              params={{ userId: artwork.artist.id }}
              className="eyebrow mt-1 block hover:text-accent"
            >
              {artwork.artist.name}
            </Link>
          ) : (
            <span className="eyebrow mt-1 block">{artwork.artist.name}</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1.5 text-xs">
            <Heart className="h-4 w-4" strokeWidth={1.5} />
            {artwork.likeCount}
          </span>
          <Link
            to="/artwork/$artworkId"
            params={{ artworkId: artwork.id }}
            hash="comments"
            className="flex items-center gap-1.5 text-xs hover:text-accent"
            aria-label={`Comments on ${artwork.title}`}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            {artwork.commentCount}
          </Link>
        </div>
      </div>
    </article>
  );
}
