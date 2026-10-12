interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-8 w-8 text-[0.65rem]",
  md: "h-12 w-12 text-xs",
  lg: "h-28 w-28 text-base",
};

export function Avatar({ name, src, size = "sm" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary tracking-[0.14em] text-muted-foreground uppercase ${sizes[size]}`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initials
      )}
    </span>
  );
}
