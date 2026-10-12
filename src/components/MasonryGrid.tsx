import type { ReactNode } from "react";

export function MasonryGrid({ children }: { children: ReactNode }) {
  return <div className="columns-1 gap-8 sm:columns-2 xl:columns-3">{children}</div>;
}
