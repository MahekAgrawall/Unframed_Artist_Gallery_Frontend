import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { usersApi } from "@/lib/api";
import { ApiNotice } from "@/components/ApiNotice";
import { useAuth } from "@/lib/auth";
import art from "@/assets/art-4.jpg";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create an Account — Unframed" },
      { name: "description", content: "Join Unframed to publish your artwork and build a portfolio artists actually visit." },
      { property: "og:title", content: "Create an Account — Unframed" },
      { property: "og:description", content: "Join Unframed and start showing your work." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const token = await usersApi.register({ name, email, password });
      if (!token) {
        await usersApi.login({ email, password });
      }
      await refresh();
      void navigate({ to: "/feed" });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="hidden border-r border-border bg-canvas lg:block">
        <img src={art} alt="Torn paper collage artwork" loading="lazy" className="h-full w-full object-cover" />
      </div>

      <div className="flex items-center px-6 py-16 md:px-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow">Join the gallery</p>
          <h1 className="mt-3 text-4xl md:text-5xl">Create account</h1>

          <form onSubmit={submit} className="mt-10 space-y-8">
            <div>
              <label htmlFor="name" className="eyebrow">
                Name
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field mt-3"
              />
            </div>
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
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>

          {status && (
            <div className="mt-6">
              <ApiNotice message={status} />
            </div>
          )}

          <p className="mt-8 text-sm text-muted-foreground">
            Already showing here?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-4 hover:text-accent">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
