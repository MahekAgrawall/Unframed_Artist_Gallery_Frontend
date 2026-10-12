import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-10 text-xs tracking-[0.16em] text-muted-foreground uppercase md:flex-row md:items-center md:justify-between md:px-10">
        <span className="font-display text-lg tracking-[0.2em] text-foreground normal-case">Unframed</span>
        <div className="flex gap-8">
          <Link to="/feed" className="hover:text-accent">
            Feed
          </Link>
          <Link to="/create" className="hover:text-accent">
            Publish
          </Link>
          <Link to="/profile/edit" className="hover:text-accent">
            Profile
          </Link>
        </div>
      </div>
    </footer>
  );
}
