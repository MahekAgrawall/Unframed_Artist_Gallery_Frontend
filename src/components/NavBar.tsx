import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/feed", label: "Feed" },
  { to: "/create", label: "Publish" },
] as const;

export function NavBar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, isAuthenticated, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    void navigate({ to: "/" });
    setOpen(false);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/feed", search: { q: query || undefined } });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-6 py-4 md:px-10">
        <Link to="/" className="font-display text-2xl tracking-[0.2em] uppercase">
          Unframed
        </Link>

        <form onSubmit={submitSearch} className="ml-auto hidden w-64 items-center gap-2 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artwork or artists"
            aria-label="Search artwork"
            className="field py-1.5 text-sm"
          />
        </form>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs tracking-[0.18em] uppercase transition-colors hover:text-accent ${
                pathname.startsWith(l.to) ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <Link to="/artists/$userId" params={{ userId: user.id }} className={`text-xs tracking-[0.18em] uppercase transition-colors hover:text-accent ${pathname.startsWith("/artists") ? "text-accent" : "text-muted-foreground"}`}>Artists</Link>
          ) : (
            <Link to="/feed" className="text-xs tracking-[0.18em] uppercase transition-colors hover:text-accent">Artists</Link>
          )}
          {isAuthenticated && user ? (
            <>
              <Link to="/artists/$userId" params={{ userId: user.id }} className="text-xs tracking-[0.18em] text-muted-foreground uppercase hover:text-accent">
                Profile
              </Link>
              <button type="button" onClick={handleSignOut} className="text-xs tracking-[0.18em] text-muted-foreground uppercase hover:text-accent">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs tracking-[0.18em] text-muted-foreground uppercase hover:text-accent">Sign in</Link>
              <Link to="/register" className="btn-ink">Join</Link>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          className="ml-auto md:hidden"
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-6 py-6 md:hidden">
          <form onSubmit={submitSearch} className="mb-6 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artwork or artists"
              aria-label="Search artwork"
              className="field py-1.5 text-sm"
            />
          </form>
          <div className="flex flex-col gap-5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-xs tracking-[0.18em] uppercase"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link to="/artists/$userId" params={{ userId: user.id }} onClick={() => setOpen(false)} className="text-xs tracking-[0.18em] uppercase">Artists</Link>
            ) : (
              <Link to="/feed" onClick={() => setOpen(false)} className="text-xs tracking-[0.18em] uppercase">Artists</Link>
            )}
            {isAuthenticated && user ? (
              <>
                <Link to="/artists/$userId" params={{ userId: user.id }} onClick={() => setOpen(false)} className="text-xs tracking-[0.18em] uppercase">Profile</Link>
                <button type="button" onClick={handleSignOut} className="self-start text-xs tracking-[0.18em] uppercase">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-xs tracking-[0.18em] uppercase">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-ink self-start">Join</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
