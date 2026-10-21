import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { READER_MESSAGE_SHELL } from "@/components/prompts/prompt-conversation";
import { CATEGORY_LABELS } from "@/lib/snapshot/categories";
import type { Prompt } from "@/lib/snapshot";
import { cn } from "@/lib/utils";

/**
 * The user's message: the Prompt a user sent to the Platform.
 *
 * The Prompt is a message and not a heading: it is what a user asked, in
 * whatever words they used, so it is drawn in the body role and it wraps. A
 * long Prompt is a long message — it keeps the line breaks the user wrote,
 * it is never cut short, and a word too long to fit is broken rather than
 * pushed past the column.
 *
 * The message sits on the right of the conversation and wears the quiet
 * surface, so it is told from the Platform's reply by where it is and by the
 * name above it — not by colour alone.
 */
export function PromptMessage({
  label,
  prompt,
}: {
  /** The name of whoever is speaking. */
  label: string;
  /** The Prompt that was sent. */
  prompt: Prompt;
}) {
  return (
    <Card className={cn(READER_MESSAGE_SHELL)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
          <Badge variant="outline" className="normal-case">
            {CATEGORY_LABELS[prompt.category]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="wrap-anywhere whitespace-pre-wrap text-sm leading-6">
          {prompt.text}
        </p>
      </CardContent>
    </Card>
  );
}
