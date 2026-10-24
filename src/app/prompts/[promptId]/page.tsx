import { notFound } from "next/navigation";
import { AnswerPanel } from "@/components/prompts/answer-panel";
import { CitationsPanel } from "@/components/prompts/citations-panel";
import { PromptDetail } from "@/components/prompts/prompt-detail";
import { PLATFORM_PARAM, resolvePlatform } from "@/lib/platform-scope";
import type { PlatformSearchParams } from "@/lib/platform-scope";
import { findAnswer, findPrompt } from "@/lib/prompt-detail";
import { snapshot } from "@/lib/snapshot";

/**
 * The prompt detail route: one tracked Prompt, the Answer the selected
 * Platform gave for it, and the sources behind that Answer.
 *
 * The route renders on the server from the Snapshot. The Prompt comes from
 * the path and the Platform from the `platform` search param, so a shared
 * link carries both halves of the view. A Prompt the Snapshot does not track
 * is a 404.
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
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {prompt.category}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {prompt.text}
      </h1>

      <PromptDetail platform={platform} asOf={snapshot.asOf}>
        <AnswerPanel answer={answer} brands={snapshot.brands} />
        <CitationsPanel citations={answer.citations} />
      </PromptDetail>
    </main>
  );
}
