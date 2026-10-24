import { describe, expect, it } from "vitest";
import { conversation } from "@/lib/prompt-conversation";
import { findAnswer, findPrompt } from "@/lib/prompt-detail";

/** The tracked Prompt the exchange below is built from. */
const PROMPT = findPrompt("p-01");
if (!PROMPT) throw new Error("missing the tracked prompt p-01");

/** The Answer the ChatGPT Platform gave for that Prompt. */
const ANSWER = findAnswer("p-01", "chatgpt");
if (!ANSWER) throw new Error("missing the ChatGPT answer for p-01");

/** The Answer the Perplexity Platform gave for that Prompt. */
const PERPLEXITY_ANSWER = findAnswer("p-01", "perplexity");
if (!PERPLEXITY_ANSWER) {
  throw new Error("missing the Perplexity answer for p-01");
}

/**
 * The Snapshot's long Prompt, and the Answer the ChatGPT Platform gave for
 * it.
 *
 * A Prompt is what a user asked, in whatever words they used: the contract
 * has no way of shortening it, so a long one arrives whole and the surfaces
 * wrap it.
 */
const LONG_PROMPT = findPrompt("p-04");
if (!LONG_PROMPT) throw new Error("missing the tracked prompt p-04");

const LONG_ANSWER = findAnswer("p-04", "chatgpt");
if (!LONG_ANSWER) throw new Error("missing the ChatGPT answer for p-04");

describe("the conversation contract", () => {
  it("puts the question before the answer", () => {
    const messages = conversation(PROMPT, ANSWER);

    expect(messages.map((message) => message.role)).toEqual([
      "user",
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
    const messages = conversation(LONG_PROMPT, LONG_ANSWER);

    expect(messages[0]).toMatchObject({ prompt: { text: LONG_PROMPT.text } });
  });
});
