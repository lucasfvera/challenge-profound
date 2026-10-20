import type { Answer, Brand, BrandId, Citation } from "./types";

/**
 * Answer segmentation: the pure pipeline that turns a stored Answer body into
 * the ordered segments the answer panel renders.
 *
 * The body is the only source of truth. Mentions are found by matching the
 * tracked brand names — whole words, ignoring case — and a `[n]` marker
 * resolves to the answer's own `n`-th citation. The pipeline never mutates
 * and never fails: text it cannot classify stays a text segment.
 */

export interface TextSegment {
  kind: "text";
  text: string;
  /** Offset of the segment in the answer body. */
  start: number;
  /** Offset just past the segment in the answer body. */
  end: number;
}

export interface MentionSegment {
  kind: "mention";
  text: string;
  /** Offset of the segment in the answer body. */
  start: number;
  /** Offset just past the segment in the answer body. */
  end: number;
  brandId: BrandId;
  /**
   * The mention's 1-based position among the answer's mentions, in document
   * order. 1 means the brand is named first.
   */
  ordinal: number;
}

export interface CitationSegment {
  kind: "citation";
  text: string;
  /** Offset of the segment in the answer body. */
  start: number;
  /** Offset just past the segment in the answer body. */
  end: number;
  citation: Citation;
}

export type AnswerSegment = TextSegment | MentionSegment | CitationSegment;

type Span =
  | { kind: "mention"; start: number; end: number; brandId: BrandId }
  | { kind: "citation"; start: number; end: number; citation: Citation };

/** Split an answer body into ordered text, mention, and citation segments. */
export function segmentAnswer(
  answer: Pick<Answer, "text" | "citations">,
  brands: Brand[],
): AnswerSegment[] {
  const spans = [...citationSpans(answer), ...mentionSpans(answer.text, brands)]
    // Earliest first; on a tie the longer span wins, so a brand name that
    // contains another ("Lumen" inside "Lumen Labs") keeps the longer match.
    .sort((left, right) => left.start - right.start || right.end - left.end);

  const segments: AnswerSegment[] = [];
  let cursor = 0;
  let ordinal = 0;

  for (const span of spans) {
    // A span that overlaps the previous one would corrupt the text between
    // them, so the first span wins and the overlapping one is dropped.
    if (span.start < cursor) continue;

    if (span.start > cursor) {
      segments.push(textSegment(answer.text, cursor, span.start));
    }

    if (span.kind === "mention") {
      ordinal += 1;
      segments.push({
        kind: "mention",
        text: answer.text.slice(span.start, span.end),
        start: span.start,
        end: span.end,
        brandId: span.brandId,
        ordinal,
      });
    } else {
      segments.push({
        kind: "citation",
        text: answer.text.slice(span.start, span.end),
        start: span.start,
        end: span.end,
        citation: span.citation,
      });
    }

    cursor = span.end;
  }

  if (cursor < answer.text.length) {
    segments.push(textSegment(answer.text, cursor, answer.text.length));
  }

  return segments;
}

function textSegment(text: string, start: number, end: number): TextSegment {
  return { kind: "text", text: text.slice(start, end), start, end };
}

function citationSpans(answer: Pick<Answer, "text" | "citations">): Span[] {
  const spans: Span[] = [];

  // Matches the `[n]` citation markers: `[` plus digits plus `]`.
  for (const match of answer.text.matchAll(/\[(\d+)\]/g)) {
    const citation = answer.citations.at(Number(match[1]) - 1);
    // A marker with no source behind it stays plain text.
    if (!citation) continue;
    spans.push({
      kind: "citation",
      start: match.index,
      end: match.index + match[0].length,
      citation,
    });
  }

  return spans;
}

function mentionSpans(text: string, brands: Brand[]): Span[] {
  const spans: Span[] = [];

  for (const brand of brands) {
    // Matches the brand name as a whole word, ignoring case: "Lumen" matches
    // "lumen", but not "illuminate".
    const pattern = new RegExp(`\\b${escapeRegExp(brand.name)}\\b`, "gi");
    for (const match of text.matchAll(pattern)) {
      spans.push({
        kind: "mention",
        start: match.index,
        end: match.index + match[0].length,
        brandId: brand.id,
      });
    }
  }

  return spans;
}

// Matches the regex metacharacters, so a brand name is matched literally.
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
