import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptMessage } from "@/components/prompts/prompt-message";
import { findPrompt } from "@/lib/prompt-detail";
import { snapshot } from "@/lib/snapshot";

/** The name the user's message carries. */
const USER_SPEAKER = "A user asked";

/** The tracked Prompt the message below carries. */
const PROMPT = snapshot.prompts[0];

/**
 * The Snapshot's long Prompt: a real user's sentence, and the case the
 * detail route's long Prompt is.
 */
const LONG_PROMPT = findPrompt("p-04");
if (!LONG_PROMPT) throw new Error("missing the tracked prompt p-04");


describe("the user's message", () => {
  it("carries the whole prompt", () => {
    render(<PromptMessage label={USER_SPEAKER} prompt={PROMPT} />);

    expect(screen.getByText(PROMPT.text)).toBeInTheDocument();
  });

  it("is a message and not a title", () => {
    render(<PromptMessage label={USER_SPEAKER} prompt={PROMPT} />);

    // The Prompt is what a user asked, so it is drawn in the body role: a
    // heading would say the page is about the question.
    expect(screen.queryByRole("heading", { name: PROMPT.text })).toBeNull();
  });

  it("names the category of the prompt", () => {
    render(<PromptMessage label={USER_SPEAKER} prompt={PROMPT} />);

    expect(screen.getByText("Comparison")).toBeInTheDocument();
  });

  it("carries a long prompt whole", () => {
    render(<PromptMessage label={USER_SPEAKER} prompt={LONG_PROMPT} />);

    // A long Prompt is a long message: it is never cut short, and it is
    // never a title either — the same rule as a short one.
    expect(screen.getByText(LONG_PROMPT.text)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: LONG_PROMPT.text }),
    ).toBeNull();
  });

});
