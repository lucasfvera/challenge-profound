"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { promptTableRows } from "@/lib/prompt-table";
import type { MentionState, PromptRow } from "@/lib/prompt-table";
import { snapshot } from "@/lib/snapshot";
import type { Platform, PlatformId, PromptCategory } from "@/lib/snapshot";
import { cn } from "@/lib/utils";

/**
 * The prompt table: every tracked Prompt, with Northstar's Mention state on
 * each Platform.
 *
 * The table is the read-only exploration view of the Snapshot. It reads the
 * rows through the prompt table contract, so the Mentions it shows are the
 * Mentions the KPI cards count, and it takes the selected Platform from the
 * caller — the scope the overview already holds — so the two halves of the
 * page never show different Platforms.
 *
 * The rows are not links: navigation into the detail route lands with a
 * later ticket, so a row carries no hover and nothing to click.
 *
 * Below `sm` the table gives way to a list of cards, the way the design
 * system's responsive conventions say it does. Both layouts render the same
 * rows and the stylesheet picks one, so the page never overflows sideways.
 */
export function PromptTable({ platformId }: { platformId: PlatformId }) {
  const rows = promptTableRows(snapshot, platformId);
  const platforms = snapshot.platforms;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracked prompts</CardTitle>
        <CardDescription>
          Every tracked Prompt, with Northstar&apos;s Mentions on each
          Platform. The number beside a Mention is the position Northstar was
          named at — 1 means it was named first. The rows are ordered by
          Northstar&apos;s strength on the selected Platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:hidden">
          {rows.map((row) => (
            <li key={row.prompt.id}>
              <PromptCard row={row} platformId={platformId} />
            </li>
          ))}
        </ul>

        <div className="hidden sm:block">
          <Table>
            <TableCaption className="sr-only">
              The tracked Prompts, with Northstar&apos;s Mention state on each
              Platform.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Prompt</TableHead>
                <TableHead>Category</TableHead>
                {platforms.map((platform) => {
                  const selected = platform.id === platformId;

                  return (
                    <TableHead
                      key={platform.id}
                      className={cn(
                        selected && "bg-secondary text-foreground",
                      )}
                    >
                      <PlatformName platform={platform} selected={selected} />
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.prompt.id}>
                  <TableCell className="whitespace-normal">
                    {row.prompt.text}
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={row.prompt.category} />
                  </TableCell>
                  {row.mentions.map((mention) => (
                    <TableCell
                      key={mention.platform.id}
                      className={cn(
                        mention.platform.id === platformId && "bg-secondary",
                      )}
                    >
                      <MentionIndicator
                        platform={mention.platform}
                        state={mention.state}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * One Prompt as a card: the base layout of the table, for the widths where
 * the table gives way.
 *
 * The card carries the same marks as the table — the category badge, the
 * Mention state of each Platform, and the Platform the table is scoped to —
 * so the two layouts say the same thing.
 */
function PromptCard({
  row,
  platformId,
}: {
  /** The row the card shows. */
  row: PromptRow;
  /** The Platform the table is scoped to. */
  platformId: PlatformId;
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-sm leading-5">{row.prompt.text}</p>
      <div className="mt-2">
        <CategoryBadge category={row.prompt.category} />
      </div>
      {/* The platforms fill the grid row by row, so the card reads in the
          same Platform order as the table's columns. */}
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {row.mentions.map((mention) => {
          const selected = mention.platform.id === platformId;

          return (
            <div
              key={mention.platform.id}
              className="flex items-center justify-between gap-2"
            >
              <dt
                className={cn(
                  "text-xs",
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <PlatformName platform={mention.platform} selected={selected} />
              </dt>
              <dd>
                <MentionIndicator
                  platform={mention.platform}
                  state={mention.state}
                />
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/**
 * The name of a Platform, marked when the table is scoped to it.
 *
 * The scope is marked with `aria-current` and with the label a screen reader
 * reads, so it never rests on colour alone.
 */
function PlatformName({
  platform,
  selected,
}: {
  /** The Platform to name. */
  platform: Platform;
  /** Whether the table is scoped to this Platform. */
  selected: boolean;
}) {
  return (
    <span aria-current={selected ? "true" : undefined}>
      {platform.name}
      {selected && <span className="sr-only"> (selected platform)</span>}
    </span>
  );
}

/**
 * The Mention state of one Answer.
 *
 * A Mention wears the brand accent as a fill — the accent is Northstar's
 * data — and carries the position Northstar was named at. A Prompt the
 * Platform answered without a Mention wears a hollow ring, and a value the
 * Snapshot cannot report shows the em dash the design system reserves for
 * it.
 *
 * The three marks are three shapes, so the state never rests on colour
 * alone, and each one carries the label a screen reader reads.
 */
function MentionIndicator({
  platform,
  state,
}: {
  /** The Platform the state belongs to. */
  platform: Platform;
  /** The state to show. */
  state: MentionState;
}) {
  if (state.kind === "mentioned") {
    return (
      <>
        <span aria-hidden="true" className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent" />
          <span className="text-xs tabular-nums text-muted-foreground">
            {state.position}
          </span>
        </span>
        <span className="sr-only">
          {`Mentioned on ${platform.name}, at position ${state.position}.`}
        </span>
      </>
    );
  }

  if (state.kind === "absent") {
    return (
      <>
        <span aria-hidden="true" className="inline-flex items-center">
          <span className="size-2.5 rounded-full border border-muted-foreground" />
        </span>
        <span className="sr-only">{`Not mentioned on ${platform.name}.`}</span>
      </>
    );
  }

  return (
    <>
      <span
        aria-hidden="true"
        className="inline-flex items-center text-muted-foreground"
      >
        —
      </span>
      <span className="sr-only">{mentionLabel(state, platform)}</span>
    </>
  );
}

/**
 * The label a screen reader reads for a cell the Snapshot cannot report a
 * Mention for.
 */
function mentionLabel(
  state: Extract<MentionState, { kind: "no-data" }>,
  platform: Platform,
): string {
  if (state.reason === "no-answer") {
    return `No answer on ${platform.name}.`;
  }

  return `No brand to measure on ${platform.name}.`;
}

/**
 * The category of a tracked Prompt, in the words the Snapshot's own
 * `PromptCategory` uses.
 */
const CATEGORY_LABELS: Record<PromptCategory, string> = {
  discovery: "Discovery",
  comparison: "Comparison",
  alternatives: "Alternatives",
  "how-to": "How-to",
  pricing: "Pricing",
  trust: "Trust",
};

/** The category of a tracked Prompt, as a quiet badge. */
function CategoryBadge({ category }: { category: PromptCategory }) {
  return <Badge variant="secondary">{CATEGORY_LABELS[category]}</Badge>;
}
