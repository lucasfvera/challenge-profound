import { describe, expect, it } from "vitest";
import { conversation } from "@/lib/prompt-conversation";
import type { Answer, Citation, Prompt } from "@/lib/snapshot";

/** The Prompt the exchange below is built from. */
const PROMPT: Prompt = {
  id: "p-01",
  text: "best AI visibility analytics tools",
  category: "comparison",
};

/** The source the Answer below cites. */
const CITATION: Citation = {
  id: "c-03",
  title: "A Buyer's Guide to AI Visibility Platforms",
  url: "https://categorybriefing.example.com/buyers-guide-ai-visibility",
  publisher: "Category Briefing",
};

/** The Answer the ChatGPT Platform gave for that Prompt. */
const ANSWER: Answer = {
  promptId: "p-01",
  platformId: "chatgpt",
  text: "Northstar covers all four assistants on a shared prompt set [1].",
  citations: [CITATION],
};

/** The Answer the Perplexity Platform gave for that Prompt. */
const PERPLEXITY_ANSWER: Answer = {
  ...ANSWER,
  platformId: "perplexity",
};

/**
 * A question a user asked in their own words, and a long one.
 *
 * A Prompt is what a user asked, in whatever words they used: the contract
 * has no way of shortening it, so a long one arrives whole and the surfaces
 * wrap it.
 */
const LONG_PROMPT: Prompt = {
  ...PROMPT,
  text: "We are a mid-market B2B software company with a small marketing team, and we can only afford to track a handful of prompts across a few assistants each month. Which AI platforms should we track for search visibility first, and how many prompts is enough to make the answers worth reading?",
};

describe("the conversation contract", () => {
  it("puts the question before the answer", () => {
    const messages = conversation(PROMPT, ANSWER);

    expect(messages.map((message) => message.role)).toEqual([
      "reader",
      "platform",
    ]);
  });

  it("names the user who sent the prompt", () => {
    const messages = conversation(PROMPT, ANSWER);

    expect(messages[0].label).toBe("A user asked");
  });

  it("names the platform that answered", () => {
    const chatgpt = conversation(PROMPT, ANSWER);
    const perplexity = conversation(PROMPT, PERPLEXITY_ANSWER);

    expect(chatgpt[1].label).toBe("ChatGPT answered");
    expect(perplexity[1].label).toBe("Perplexity answered");
  });

  it("carries the prompt that was sent", () => {
    const messages = conversation(PROMPT, ANSWER);

    expect(messages[0]).toMatchObject({ prompt: PROMPT });
  });

  it("carries the answer the platform gave", () => {
    const messages = conversation(PROMPT, ANSWER);

    expect(messages[1]).toMatchObject({ answer: ANSWER });
  });

  it("gives every message one payload", () => {
    const messages = conversation(PROMPT, ANSWER);

    expect(messages[0]).not.toHaveProperty("answer");
    expect(messages[1]).not.toHaveProperty("prompt");
  });

  it("carries a long prompt whole", () => {
    const messages = conversation(LONG_PROMPT, ANSWER);

    expect(messages[0]).toMatchObject({ prompt: { text: LONG_PROMPT.text } });
  });
});
