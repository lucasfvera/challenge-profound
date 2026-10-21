import { platformById } from "@/lib/snapshot/platforms";
import type { Answer, Prompt } from "@/lib/snapshot";

/**
 * The conversation contract: the prompt detail route's read of the exchange.
 *
 * The route shows one tracked Prompt, the Answer a Platform gave for it, and
 * the sources behind that Answer. The exchange itself is what this contract
 * describes: the question that was sent, and the reply that came back, in the
 * order they happened.
 *
 * The contract states the two labels, so a surface never has to name a
 * Platform itself: the reply is labelled with the Platform that gave the
 * Answer, and it cannot be labelled with another Platform's name, because the
 * name is read from the Answer rather than passed in beside it.
 *
 * The contract never shortens a Prompt. A Prompt is what a user asked, in
 * whatever words they used, and a long one is a message like any other: it
 * carries its whole text, and the surfaces wrap it.
 */

/**
 * One message of the exchange.
 *
 * The two messages carry different payloads, and the union says so: the
 * reader's message carries the Prompt that was sent, and the Platform's
 * message carries the Answer that came back. A surface therefore cannot read
 * the Answer off the reader's message, or the Prompt off the reply.
 */
export type ConversationMessage =
  | {
      /** The reader sent the Prompt. */
      role: "reader";
      /** The label the message carries: who is speaking, in words. */
      label: string;
      /** The Prompt that was sent. */
      prompt: Prompt;
    }
  | {
      /** The Platform gave the Answer. */
      role: "platform";
      /** The label the message carries: who is speaking, in words. */
      label: string;
      /** The Answer that came back. */
      answer: Answer;
    };

/**
 * The label the reader's message carries.
 *
 * A tracked Prompt is a question real users ask the assistants, so the
 * person who sent it is one of those users and not the reader of the
 * dashboard: the label names them as "a user" and not as "you".
 */
const READER_LABEL = "A user asked";

/**
 * The exchange a Prompt and the Answer it got make, in order: the question
 * first, the reply after it.
 *
 * The order is the exchange's order, so no surface can render the reply
 * before the question that earned it.
 */
export function conversation(
  prompt: Prompt,
  answer: Answer,
): ConversationMessage[] {
  return [
    { role: "reader", label: READER_LABEL, prompt },
    { role: "platform", label: platformLabel(answer), answer },
  ];
}

/**
 * The label the Platform's message carries: the Platform's own name and what
 * it did.
 *
 * The name is read from the Answer, so the reply always wears the name of the
 * Platform that gave it — the label and the Answer cannot drift apart.
 */
function platformLabel(answer: Answer): string {
  return `${platformById(answer.platformId).name} answered`;
}
