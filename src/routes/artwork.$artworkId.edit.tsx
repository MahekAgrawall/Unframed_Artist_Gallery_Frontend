import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { artworksApi } from "@/lib/api";
import { ApiNotice } from "@/components/ApiNotice";

export const Route = createFileRoute("/artwork/$artworkId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Artwork — Unframed" },
      { name: "description", content: "Update the title, description or image of a piece in your Unframed portfolio." },
      { property: "og:title", content: "Edit Artwork — Unframed" },
      { property: "og:description", content: "Update a piece in your Unframed portfolio." },
    ],
  }),
  component: EditArtwork,
});

function EditArtwork() {
  const { artworkId } = Route.useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({
    queryKey: ["artwork", artworkId],
    queryFn: ({ signal }) => artworksApi.getArtwork(artworkId, signal),
  });

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setDescription(data.description);
    setImageUrl(data.imageUrl);
  }, [data]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      await artworksApi.updateArtwork(artworkId, { title, description, imageUrl });
      void navigate({ to: "/artwork/$artworkId", params: { artworkId } });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="eyebrow">Revision</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Edit work</h1>

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
            className="field mt-3"
          />
        </div>

        <button type="submit" disabled={busy} className="btn-ink disabled:opacity-60">
          {busy ? "Saving…" : "Save changes"}
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
