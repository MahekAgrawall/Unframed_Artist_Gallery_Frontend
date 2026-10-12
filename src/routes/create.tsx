import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { artworksApi } from "@/lib/api";
import { ApiNotice } from "@/components/ApiNotice";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Publish Artwork — Unframed" },
      { name: "description", content: "Add a new piece to your Unframed portfolio: title, description and image." },
      { property: "og:title", content: "Publish Artwork — Unframed" },
      { property: "og:description", content: "Add a new piece to your Unframed portfolio." },
    ],
  }),
  component: CreateArtwork,
});

function CreateArtwork() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const artwork = await artworksApi.createArtwork({ title, description, imageUrl });
      if (artwork.id) {
        void navigate({ to: "/artwork/$artworkId", params: { artworkId: artwork.id } });
      } else {
        setStatus("Published.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="eyebrow">New submission</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Publish a work</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Give the piece a title, a few words of context, and a link to a high-resolution image.
      </p>

      {!loading && !isAuthenticated && (
        <div className="mt-8">
          <ApiNotice message="You need to sign in before you can publish work." />
        </div>
      )}

      <form onSubmit={submit} className="mt-12 space-y-10">
        <div>
          <label htmlFor="title" className="eyebrow">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ochre Study No. 4"
            className="field mt-3"
          />
        </div>

        <div>
          <label htmlFor="description" className="eyebrow">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Materials, process, what you were after."
            className="field mt-3 resize-none"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="eyebrow">
            Image URL
          </label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            placeholder="https://…"
            className="field mt-3"
          />
        </div>

        {imageUrl && (
          <div className="frame p-3 hover:translate-y-0">
            <img src={imageUrl} alt="Preview of the artwork" className="w-full bg-canvas object-contain" />
          </div>
        )}

        <button type="submit" disabled={busy} className="btn-ink disabled:opacity-60">
          {busy ? "Publishing…" : "Publish"}
        </button>
      </form>

      {status && (
        <div className="mt-8">
          <ApiNotice message={status} />
        </div>
      )}
    </div>
  );
}
