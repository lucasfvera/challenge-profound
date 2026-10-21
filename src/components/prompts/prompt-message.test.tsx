import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptMessage } from "@/components/prompts/prompt-message";
import { snapshot } from "@/lib/snapshot";

/** The name the reader's message carries. */
const READER_SPEAKER = "A user asked";

/** The tracked Prompt the message below carries. */
const prompt = snapshot.prompts[0];

describe("the reader's message", () => {
  it("carries the whole prompt", () => {
    render(<PromptMessage label={READER_SPEAKER} prompt={prompt} />);

    expect(screen.getByText(prompt.text)).toBeInTheDocument();
  });

  it("is a message and not a title", () => {
    render(<PromptMessage label={READER_SPEAKER} prompt={prompt} />);

    // The Prompt is what a user asked, so it is drawn in the body role: a
    // heading would say the page is about the question.
    expect(screen.queryByRole("heading", { name: prompt.text })).toBeNull();
  });

  it("names the category of the prompt", () => {
    render(<PromptMessage label={READER_SPEAKER} prompt={prompt} />);

    expect(screen.getByText("Comparison")).toBeInTheDocument();
  });
});
