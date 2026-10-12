/** Honest status line: this build has no backend attached yet. */
export function ApiNotice({ message }: { message?: string }) {
  return (
    <p className="border-l-2 border-accent bg-secondary/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      {message ??
        "Not connected to a server yet. This screen is wired to the Unframed API layer — point it at your Spring Boot service and it goes live."}
    </p>
  );
}
