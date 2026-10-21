import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptMessage } from "@/components/prompts/prompt-message";
import { findPrompt } from "@/lib/prompt-detail";
import { snapshot } from "@/lib/snapshot";
import type { Prompt } from "@/lib/snapshot";

/** The name the user's message carries. */
const READER_SPEAKER = "A user asked";

/** The tracked Prompt the message below carries. */
const PROMPT = snapshot.prompts[0];

/**
 * The Snapshot's long Prompt: a real user's sentence, and the case the
 * detail route's long Prompt is.
 */
const LONG_PROMPT = findPrompt("p-04");
if (!LONG_PROMPT) throw new Error("missing the tracked prompt p-04");

/**
 * A Prompt carrying a word too long to fit on a line.
 *
 * A marketer pastes the link they are working from, and a link does not
 * break where a word does. The id is borrowed — the tracked ids are a
 * closed set — and the category is the one the question really is.
 */
const PROMPT_WITH_A_LONG_WORD: Prompt = {
  id: "p-03",
  text: "how do I track https://northstar.example.com/reports/2026/q3/ai-brand-visibility?utm_source=newsletter&utm_campaign=ai-visibility-check for my brand mentions",
  category: "how-to",
};

describe("the user's message", () => {
  it("carries the whole prompt", () => {
    render(<PromptMessage label={READER_SPEAKER} prompt={PROMPT} />);

    expect(screen.getByText(PROMPT.text)).toBeInTheDocument();
  });

  it("is a message and not a title", () => {
    render(<PromptMessage label={READER_SPEAKER} prompt={PROMPT} />);

    // The Prompt is what a user asked, so it is drawn in the body role: a
    // heading would say the page is about the question.
    expect(screen.queryByRole("heading", { name: PROMPT.text })).toBeNull();
  });

  it("names the category of the prompt", () => {
    render(<PromptMessage label={READER_SPEAKER} prompt={PROMPT} />);

    expect(screen.getByText("Comparison")).toBeInTheDocument();
  });

  it("carries a long prompt whole", () => {
    render(<PromptMessage label={READER_SPEAKER} prompt={LONG_PROMPT} />);

    // A long Prompt is a long message: it is never cut short, and it is
    // never a title either — the same rule as a short one.
    expect(screen.getByText(LONG_PROMPT.text)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: LONG_PROMPT.text }),
    ).toBeNull();
  });

  it("carries a word too long to fit", () => {
    render(
      <PromptMessage label={READER_SPEAKER} prompt={PROMPT_WITH_A_LONG_WORD} />,
    );

    // The whole Prompt is in the document: the message never shortens it.
    // Whether the word is broken inside the column is a layout, and no suite
    // here reads a layout — the rule is the design system's.
    expect(
      screen.getByText(PROMPT_WITH_A_LONG_WORD.text),
    ).toBeInTheDocument();
  });
});
