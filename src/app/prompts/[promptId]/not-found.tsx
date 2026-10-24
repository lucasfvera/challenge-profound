import Link from "next/link";
import { Button } from "@/components/ui/button";
import { snapshot } from "@/lib/snapshot";

/**
 * The 404 of the prompt detail route: no answer for the prompt in the URL.
 *
 * The route calls `notFound()` for a Prompt id it cannot resolve and for a
 * Platform that has no answer for it, so this page is what a hand-edited or
 * mistyped id lands on.
 */
export default function PromptNotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Prompt not found
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        The Snapshot has no answer for this prompt
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
        The Snapshot holds {snapshot.prompts.length} tracked prompts. This id
        is not one of them, or the platform in the URL has no answer for it.
      </p>
      <Button
        variant="link"
        className="mt-6"
        render={<Link href="/">Back to the overview</Link>}
      />
    </main>
  );
}
