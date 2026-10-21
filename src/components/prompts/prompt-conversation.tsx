import type { ReactNode } from "react";

/**
 * The conversation's shell: the ordered list the exchange lives in.
 *
 * The shell lives in its own module because two very different consumers
 * need it: the transcript, which draws the exchange, and the loading
 * skeleton, which holds the exchange's place while the Answer for the
 * current URL is on its way. Both draw the same list, so the page does not
 * jump when the content arrives.
 *
 * The shell is kept away from the transcript's own module on purpose: the
 * transcript draws the Answer's segments and reads the Snapshot to do it, and
 * the skeleton is a client component that must not pull the Snapshot into the
 * browser to hold the place of a list.
 */

/**
 * The reader's message's shell: a quiet bubble on the right of the
 * conversation.
 *
 * The bubble hugs its text and is capped at 85% of the column, so a short
 * Prompt is a short bubble and a long one fills the column instead of running
 * past it. The skeleton wears the same shell, so the exchange keeps its shape
 * while the Answer is on its way.
 */
export const READER_MESSAGE_SHELL =
  "ml-auto w-fit max-w-[85%] gap-2 bg-secondary";

/**
 * The Platform's message's shell: a panel that fills the column.
 *
 * The reply runs the width of the conversation, the way a reply does in a
 * chat, and the skeleton wears the same shell.
 */
export const PLATFORM_MESSAGE_SHELL = "gap-2";

export function PromptConversation({ children }: { children: ReactNode }) {
  return (
    <ol aria-label="Conversation" className="mt-6 flex flex-col gap-4">
      {children}
    </ol>
  );
}
