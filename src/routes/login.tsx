import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { usersApi } from "@/lib/api";
import { ApiNotice } from "@/components/ApiNotice";
import { useAuth } from "@/lib/auth";
import art from "@/assets/art-6.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Unframed" },
      { name: "description", content: "Sign in to your Unframed account to publish work and follow artists." },
      { property: "og:title", content: "Sign In — Unframed" },
      { property: "og:description", content: "Sign in to your Unframed account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      await usersApi.login({ email, password });
      await refresh();
      void navigate({ to: "/feed" });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="flex items-center px-6 py-16 md:px-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Welcome back</p>
          <h1 className="mt-3 text-4xl md:text-5xl">Sign in</h1>

          <form onSubmit={submit} className="mt-10 space-y-8">
            <div>
              <label htmlFor="email" className="eyebrow">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field mt-3"
              />
            </div>
            <div>
              <label htmlFor="password" className="eyebrow">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field mt-3"
              />
            </div>
            <button type="submit" disabled={busy} className="btn-ink w-full disabled:opacity-60">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {status && (
            <div className="mt-6">
              <ApiNotice message={status} />
            </div>
          )}

          <p className="mt-8 text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="text-foreground underline underline-offset-4 hover:text-accent">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden border-l border-border bg-canvas lg:block">
        <img src={art} alt="Sunlit arch, fine art photograph" loading="lazy" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
