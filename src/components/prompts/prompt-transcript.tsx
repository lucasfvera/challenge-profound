import { AnswerMessage } from "@/components/prompts/answer-message";
import { PromptConversationShell } from "@/components/prompts/prompt-conversation-shell";
import { PromptMessage } from "@/components/prompts/prompt-message";
import { conversation } from "@/lib/prompt-conversation";
import type { Answer, Brand, Prompt } from "@/lib/snapshot";

/**
 * The conversation: the exchange the prompt detail route shows.
 *
 * The route draws an exchange rather than a page about a question: a user
 * sent the Prompt, the Platform gave the Answer, and each message carries the
 * name of whoever is speaking. The order and the speakers come from the
 * conversation contract, so the exchange reads the same wherever it is drawn.
 */
export function PromptTranscript({
  prompt,
  answer,
  brands,
}: {
  /** The tracked Prompt the user sent. */
  prompt: Prompt;
  /** The Answer the Platform gave for it. */
  answer: Answer;
  /** The brands the Snapshot tracks, which the segmentation matches on. */
  brands: Brand[];
}) {
  const messages = conversation(prompt, answer);

  return (
    <PromptConversationShell>
      {messages.map((message) => (
        <li key={message.role}>
          {message.role === "user" ? (
            <PromptMessage label={message.label} prompt={message.prompt} />
          ) : (
            <AnswerMessage
              label={message.label}
              answer={message.answer}
              brands={brands}
            />
          )}
        </li>
      ))}
    </PromptConversationShell>
  );
}
