import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { ApiNotice } from "@/components/ApiNotice";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({
    meta: [
      { title: "Edit Profile — Unframed" },
      { name: "description", content: "Update your Unframed name, bio and profile image." },
      { property: "og:title", content: "Edit Profile — Unframed" },
      { property: "og:description", content: "Update your Unframed name, bio and profile image." },
    ],
  }),
  component: EditProfile,
});

function EditProfile() {
  const { user, loading, isAuthenticated, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setBio(user.bio);
    setProfileImageUrl(user.profileImageUrl);
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      await usersApi.updateMe({ name, bio, profileImageUrl });
      await refresh();
      setStatus("Profile saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const removeAccount = async () => {
    if (!window.confirm("Delete your account and all of your work? This cannot be undone.")) return;
    setBusy(true);
    try {
      await usersApi.deleteMe();
      signOut();
      void navigate({ to: "/" });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not delete your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="eyebrow">Your details</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Edit profile</h1>

      {!loading && !isAuthenticated && (
        <div className="mt-8">
          <ApiNotice message="Sign in to view and edit your profile." />
        </div>
      )}

      <div className="mt-10 flex items-center gap-5 border-y border-border py-6">
        <Avatar name={name || "Your Name"} src={profileImageUrl} size="md" />
        <div>
          <p className="font-display text-xl">{name || "Your name"}</p>
          <p className="text-sm text-muted-foreground">{bio || "Your bio appears here."}</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-10 space-y-10">
        <div>
          <label htmlFor="name" className="eyebrow">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Mara Ellison"
            className="field mt-3"
          />
        </div>

        <div>
          <label htmlFor="bio" className="eyebrow">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="What you make, and how."
            className="field mt-3 resize-none"
          />
        </div>

        <div>
          <label htmlFor="profileImageUrl" className="eyebrow">
            Profile image URL
          </label>
          <input
            id="profileImageUrl"
            type="url"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            placeholder="https://…"
            className="field mt-3"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="btn-ink disabled:opacity-60">
            {busy ? "Saving…" : "Save changes"}
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={removeAccount}
              disabled={busy}
              className="btn-outline disabled:opacity-60"
            >
              Delete account
            </button>
          )}
        </div>
      </form>

      {status && (
        <div className="mt-8">
          <ApiNotice message={status} />
        </div>
      )}
    </div>
  );
}
