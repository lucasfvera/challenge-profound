import type { ReactNode } from "react";

/**
 * The detail route's content layout: the answer and the citations side by
 * side from `md`, stacked below it.
 *
 * The grid lives here so the route and the loading skeleton render the same
 * layout, and the page does not jump when the content arrives.
 */
export function PromptDetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      {children}
    </div>
  );
}
