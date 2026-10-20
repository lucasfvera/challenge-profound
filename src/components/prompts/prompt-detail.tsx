"use client";

import type { ReactNode } from "react";
import { PlatformScope } from "@/components/platform-scope";
import { PromptDetailLayout } from "@/components/prompts/prompt-detail-layout";
import { PromptDetailSkeleton } from "@/components/prompts/prompt-detail-skeleton";
import type { Platform } from "@/lib/snapshot";
import { usePlatformScope } from "@/lib/use-platform-scope";

/**
 * The detail route's client boundary: the platform scope and the content the
 * scope filters.
 *
 * Switching the Platform is a navigation, not a local swap: the URL carries
 * the Platform, and the server answers with that Platform's Answer. The
 * skeleton holds the content while the answer is on its way, so the page
 * never shows one Platform's answer under another's name.
 */
export function PromptDetail({
  platform,
  asOf,
  children,
}: {
  /** The Platform the URL names. */
  platform: Platform;
  /** The day the Snapshot's stored Answers belong to. */
  asOf: string;
  /** The server-rendered content the Platform filters. */
  children: ReactNode;
}) {
  const { selected, select, isPending } = usePlatformScope(platform);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {selected.name} · Snapshot as of{" "}
          <time dateTime={asOf}>{asOf}</time>
        </p>
        <PlatformScope platformId={selected.id} onPlatformChange={select} />
      </div>
      {isPending ? (
        <PromptDetailSkeleton />
      ) : (
        <PromptDetailLayout>{children}</PromptDetailLayout>
      )}
    </>
  );
}
