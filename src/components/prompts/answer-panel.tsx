import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { segmentAnswer } from "@/lib/snapshot";
import type { Answer, Brand } from "@/lib/snapshot";
import { citationAnchorId } from "@/lib/prompt-detail";
import { cn } from "@/lib/utils";

/**
 * The answer panel: the Answer a Platform gave for a tracked Prompt.
 *
 * The body is rendered from the segments the Snapshot's own segmentation
 * produces, so the Mentions and the Citation markers on this panel are the
 * ones the KPI cards count.
 *
 * Northstar's Mentions wear the brand accent as a fill, the pairing the
 * design system sanctions — accent text on a card would sit at 4.45:1, under
 * the AA the design system asks of body text. The Competitors' Mentions wear
 * the foreground colour with a dotted underline: a line treatment, the way
 * the design system tells the competitor series from Northstar. Both
 * treatments carry a hidden label, so a screen reader says which brand a
 * mention names and whether it is the brand being measured.
 */
export function AnswerPanel({
  answer,
  brands,
}: {
  /** The Answer to show. */
  answer: Answer;
  /** The brands the Snapshot tracks, which the segmentation matches on. */
  brands: Brand[];
}) {
  const segments = segmentAnswer(answer, brands);
  const kindsById = new Map(brands.map((brand) => [brand.id, brand.kind]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Answer</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6">
          {segments.map((segment) => {
            // The offset in the body is the segment's identity: the
            // segments are ordered and never move.
            const key = `${segment.kind}-${segment.start}`;

            if (segment.kind === "mention") {
              return (
                <Mention
                  key={key}
                  text={segment.text}
                  isSubject={kindsById.get(segment.brandId) === "subject"}
                />
              );
            }

            if (segment.kind === "citation") {
              return (
                <CitationMarker
                  key={key}
                  text={segment.text}
                  citation={segment.citation}
                />
              );
            }

            return <span key={key}>{segment.text}</span>;
          })}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * A brand named inside the answer.
 *
 * The visible text is the brand name the answer used. The label a screen
 * reader reads is hidden, so the spoken reading says what the fill and the
 * underline say.
 */
function Mention({
  text,
  isSubject,
}: {
  /** The brand name as it appears in the answer. */
  text: string;
  /** Whether the brand is the one the Snapshot measures. */
  isSubject: boolean;
}) {
  return (
    <span
      className={cn(
        isSubject
          ? "bg-accent text-accent-foreground"
          : "underline decoration-dotted decoration-muted-foreground underline-offset-4",
      )}
    >
      {text}
      <span className="sr-only">
        {isSubject ? " (the brand being measured)" : " (competitor)"}
      </span>
    </span>
  );
}

/**
 * A Citation marker in the body: it links to the Citation's entry in the
 * citations panel.
 *
 * The accessible name starts with the marker itself, so the name a screen
 * reader reads contains the text on screen.
 */
function CitationMarker({
  text,
  citation,
}: {
  /** The marker as it appears in the answer, e.g. `[1]`. */
  text: string;
  /** The Citation the marker points at. */
  citation: Answer["citations"][number];
}) {
  return (
    <a
      href={`#${citationAnchorId(citation.id)}`}
      aria-label={`${text} ${citation.title}`}
      className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
    >
      {text}
    </a>
  );
}
