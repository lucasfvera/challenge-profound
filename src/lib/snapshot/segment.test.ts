import { describe, expect, it } from "vitest";
import { segmentAnswer, snapshot } from "@/lib/snapshot";
import type { CitationSegment, MentionSegment } from "@/lib/snapshot";

describe("answer segmentation", () => {
  it("splits an answer into ordered text, mention, and citation segments", () => {
    const answer = snapshot.answers.find(
      (entry) => entry.promptId === "p-01" && entry.platformId === "chatgpt",
    );
    if (!answer) throw new Error("missing the ChatGPT answer for p-01");

    const segments = segmentAnswer(answer, snapshot.brands);

    expect(segments.map((segment) => segment.kind)).toEqual([
      "text",
      "mention",
      "text",
      "citation",
      "text",
      "mention",
      "text",
      "mention",
      "text",
      "citation",
      "text",
    ]);

    const mentions = segments.filter(
      (segment): segment is MentionSegment => segment.kind === "mention",
    );
    expect(mentions.map((mention) => mention.brandId)).toEqual([
      "northstar",
      "lumen",
      "arcadia",
    ]);
    expect(mentions.map((mention) => mention.ordinal)).toEqual([1, 2, 3]);

    const citations = segments.filter(
      (segment): segment is CitationSegment => segment.kind === "citation",
    );
    expect(citations.map((segment) => segment.citation.id)).toEqual([
      "c-03",
      "c-01",
    ]);

    // The segments must rebuild the answer body exactly.
    expect(segments.map((segment) => segment.text).join("")).toBe(answer.text);
  });

  it("leaves an answer without mentions or markers as a single text segment", () => {
    const segments = segmentAnswer(
      { text: "No tracked brand is named in this answer.", citations: [] },
      snapshot.brands,
    );

    expect(segments).toHaveLength(1);
    expect(segments[0].kind).toBe("text");
  });

  it("keeps a citation marker without a source behind it as plain text", () => {
    const onlyCitation = snapshot.answers[0].citations[0];

    for (const marker of ["[2]", "[0]"]) {
      const body = `The answer cites a source that is not in its list ${marker}.`;
      const segments = segmentAnswer(
        { text: body, citations: [onlyCitation] },
        snapshot.brands,
      );

      expect(segments.map((segment) => segment.kind)).toEqual(["text"]);
      expect(segments.map((segment) => segment.text).join("")).toBe(body);
    }
  });
});
