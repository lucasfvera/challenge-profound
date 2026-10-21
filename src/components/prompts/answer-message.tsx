import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_MESSAGE_SHELL } from "@/components/prompts/prompt-conversation";
import { citationAnchorId, isSafeExternalUrl } from "@/lib/prompt-detail";
import { segmentAnswer } from "@/lib/snapshot";
import type { Answer, Brand, Citation } from "@/lib/snapshot";
import { cn } from "@/lib/utils";

/**
 * The Platform's message: the Answer a Platform gave for the Prompt, and the
 * Citations it used.
 *
 * The body is rendered from the segments the Snapshot's own segmentation
 * produces, so the Mentions and the Citation markers on this message are the
 * ones the KPI cards count.
 *
 * Northstar's Mentions wear the brand accent as a fill, the pairing the
 * design system sanctions — accent text on a card would sit at 4.45:1, under
 * the AA the design system asks of body text. The Competitors' Mentions wear
 * the foreground colour with a dotted underline: a line treatment, the way
 * the design system tells the competitor series from Northstar. Both
 * treatments carry a hidden label, so a screen reader says which brand a
 * mention names and whether it is the brand being measured.
 *
 * The Citations live inside the message, the way a chat shows the sources
 * under the reply that used them: they belong to this Answer, and a reader
 * who scrolls the reply finds them beside it.
 */
export function AnswerMessage({
  label,
  answer,
  brands,
}: {
  /** The name of whoever is speaking. */
  label: string;
  /** The Answer the Platform gave. */
  answer: Answer;
  /** The brands the Snapshot tracks, which the segmentation matches on. */
  brands: Brand[];
}) {
  const segments = segmentAnswer(answer, brands);
  const kindsById = new Map(brands.map((brand) => [brand.id, brand.kind]));

  return (
    <Card className={cn(PLATFORM_MESSAGE_SHELL)}>
      <CardHeader>
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="wrap-anywhere text-sm leading-6">
          {segments.map((segment) => {
            // The offset in the body is the segment's identity: the
            // segments are ordered and never move.
            const key = `${segment.kind}-${segment.start}`;

            switch (segment.kind) {
              case "mention":
                return (
                  <Mention
                    key={key}
                    text={segment.text}
                    isSubject={kindsById.get(segment.brandId) === "subject"}
                  />
                );

              case "citation":
                return (
                  <CitationMarker
                    key={key}
                    text={segment.text}
                    citation={segment.citation}
                  />
                );

              case "text":
                return <span key={key}>{segment.text}</span>;
            }
          })}
        </p>
        <Citations citations={answer.citations} />
      </CardContent>
    </Card>
  );
}

/**
 * The Citations the Answer used, and the note that says where they come from.
 *
 * The list is ordered, so the number in the answer body is the number in the
 * list. Every source is a link that opens in a new tab, and a source whose
 * URL the contract refuses is rendered as text rather than as a link.
 */
function Citations({ citations }: { citations: Citation[] }) {
  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Citations
      </p>
      {/* The list carries its own numbers: the marker in the answer body
          points at the entry with the same number. A flex container would
          blockify the items and drop the markers, so the spacing between
          them is a margin. */}
      <ol className="mt-2 list-decimal space-y-3 pl-5">
        {citations.map((citation) => (
          <li
            key={citation.id}
            id={citationAnchorId(citation.id)}
            // The marker in the answer body links here, so the entry has
            // to be focusable for the link to move the focus, not only the
            // viewport.
            tabIndex={-1}
            className="text-sm leading-5"
          >
            <CitationLink citation={citation} />
            <p className="text-muted-foreground">{citation.publisher}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs leading-4 text-muted-foreground">
        Simulated data. These sources come from the Snapshot&apos;s fixture:
        the publications are fictional and sit on reserved example domains.
        Nothing here was fetched from a live platform.
      </p>
    </div>
  );
}

/**
 * A source behind the answer: a link, or plain text when it cannot be one.
 */
function CitationLink({ citation }: { citation: Citation }) {
  if (!isSafeExternalUrl(citation.url)) {
    return <span>{citation.title}</span>;
  }

  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground"
    >
      {citation.title}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
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
 * citations list.
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
