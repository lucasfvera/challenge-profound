import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { citationAnchorId, isSafeExternalUrl } from "@/lib/prompt-detail";
import type { Citation } from "@/lib/snapshot";

/**
 * The citations panel: the sources behind an Answer, and the note that says
 * where they come from.
 *
 * The list is ordered, so the number in the answer body is the number in the
 * list. Every source is a link that opens in a new tab, and a source whose
 * URL the contract refuses is rendered as text rather than as a link.
 */
export function CitationsPanel({ citations }: { citations: Citation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Citations</CardTitle>
        <CardDescription>The sources this answer cites.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* The list carries its own numbers: the marker in the answer body
            points at the entry with the same number. A flex container would
            blockify the items and drop the markers, so the spacing between
            them is a margin. */}
        <ol className="list-decimal space-y-3 pl-5">
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
        <p className="mt-4 border-t border-border pt-4 text-xs leading-4 text-muted-foreground">
          Simulated data. These sources come from the Snapshot&apos;s fixture:
          the publications are fictional and sit on reserved example domains.
          Nothing here was fetched from a live platform.
        </p>
      </CardContent>
    </Card>
  );
}

/** A source behind the answer: a link, or plain text when it cannot be one. */
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
