import Link from "next/link";
import { notFound } from "next/navigation";
import { PromptDetail } from "@/components/prompts/prompt-detail";
import { PromptTranscript } from "@/components/prompts/prompt-transcript";
import { buttonVariants } from "@/components/ui/button";
import {
  overviewHref,
  PLATFORM_PARAM,
  resolvePlatform,
} from "@/lib/platform-scope";
import type { PlatformSearchParams } from "@/lib/platform-scope";
import { findAnswer, findPrompt } from "@/lib/prompt-detail";
import { snapshot } from "@/lib/snapshot";
import { cn } from "@/lib/utils";

/**
 * The prompt detail route: one tracked Prompt, the Answer the selected
 * Platform gave for it, and the Citations it used.
 *
 * The route renders on the server from the Snapshot. The Prompt comes from
 * the path and the Platform from the `platform` search param, so a shared
 * link carries both halves of the view. A Prompt the Snapshot does not track
 * is a 404.
 *
 * The route carries its way back to the overview, scoped to the Platform it
 * is showing: the drill-down out of the table is one half of the flow, and
 * on a phone — where there is no browser chrome — the way back is the other.
 *
 * The page names what it holds before the exchange starts, so it reads on its
 * own: the heading names the two halves of a tracked Prompt and its Answer,
 * and the exchange below says which Platform answered.
 */
export default async function PromptPage({
  params,
  searchParams,
}: {
  params: Promise<{ promptId: string }>;
  searchParams: Promise<PlatformSearchParams>;
}) {
  const { promptId } = await params;
  const search = await searchParams;

  const prompt = findPrompt(promptId);
  if (!prompt) notFound();

  const platform = resolvePlatform(search[PLATFORM_PARAM]);
  const answer = findAnswer(prompt.id, platform.id);
  if (!answer) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      {/* The way back is a link, so it is a link and not a button: a control
          that navigates has to say so. The button's link variant gives it the
          app's own link styling, and the variant's own padding is dropped so
          the link's text sits on the page's edge with the rest of the route. */}
      <Link
        href={overviewHref(platform.id)}
        className={cn(buttonVariants({ variant: "link" }), "px-0")}
      >
        Back to the overview
      </Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Prompt and Answer
      </h1>
      <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
        One tracked Prompt sent to a Platform, and the Answer it gave.
      </p>

      <PromptDetail platform={platform} asOf={snapshot.asOf}>
        <PromptTranscript
          prompt={prompt}
          answer={answer}
          brands={snapshot.brands}
        />
      </PromptDetail>
    </main>
  );
}
