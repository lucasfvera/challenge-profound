import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptTranscript } from "@/components/prompts/prompt-transcript";
import { findAnswer, findPrompt } from "@/lib/prompt-detail";
import { snapshot } from "@/lib/snapshot";

/** The tracked Prompt the exchange below is built from. */
const prompt = findPrompt("p-01");
if (!prompt) throw new Error("missing the tracked prompt p-01");

/** The Answer the Snapshot holds for that Prompt on ChatGPT. */
const answer = findAnswer("p-01", "chatgpt");
if (!answer) throw new Error("missing the ChatGPT answer for p-01");

describe("the conversation", () => {
  it("names the exchange", () => {
    render(
      <PromptTranscript
        prompt={prompt}
        answer={answer}
        brands={snapshot.brands}
      />,
    );

    // The list carries a name of its own, so it is never confused with the
    // citations list inside the reply.
    expect(
      screen.getByRole("list", { name: "Conversation" }),
    ).toBeInTheDocument();
  });

  it("puts the question before the answer", () => {
    render(
      <PromptTranscript
        prompt={prompt}
        answer={answer}
        brands={snapshot.brands}
      />,
    );

    const messages = within(
      screen.getByRole("list", { name: "Conversation" }),
    ).getAllByRole("listitem");

    // The question comes first and the reply after it. The citations inside
    // the reply are list items of their own, so they follow it.
    expect(messages[0]).toHaveTextContent("A user asked");
    expect(messages[1]).toHaveTextContent("ChatGPT answered");
  });

  it("keeps the citations inside the reply", () => {
    render(
      <PromptTranscript
        prompt={prompt}
        answer={answer}
        brands={snapshot.brands}
      />,
    );

    const messages = within(
      screen.getByRole("list", { name: "Conversation" }),
    ).getAllByRole("listitem");

    // The Citations belong to the Answer, so they travel with the reply.
    expect(within(messages[1]).getByRole("list")).toBeInTheDocument();
  });
});
