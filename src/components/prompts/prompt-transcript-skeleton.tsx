import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  PLATFORM_MESSAGE_SHELL,
  PromptConversation,
  READER_MESSAGE_SHELL,
} from "@/components/prompts/prompt-conversation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * The conversation's loading skeleton: the placeholders that hold the
 * exchange while the Answer for the current URL is on its way.
 *
 * It stands in for the conversation's own content — the reader's message and
 * the Platform's reply with the Citations inside it, in the order they
 * happen — so the page does not jump when the Answer arrives. The skeleton
 * is inert, the way the base component is: it has no interactive states, only
 * the placeholder blocks.
 */
export function PromptTranscriptSkeleton() {
  return (
    <PromptConversation>
      <li>
        <Card className={cn(READER_MESSAGE_SHELL)}>
          <CardHeader>
            <Skeleton className="h-3 w-28" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      </li>
      <li>
        <Card className={cn(PLATFORM_MESSAGE_SHELL)}>
          <CardHeader>
            <Skeleton className="h-3 w-36" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            {/* The Citations live inside the reply, so the reply's skeleton
                holds their place as well. */}
            <div className="mt-4 border-t border-border pt-4">
              <Skeleton className="h-3 w-16" />
              <div className="mt-2 flex flex-col gap-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="mt-4 h-3 w-4/5" />
            </div>
          </CardContent>
        </Card>
      </li>
    </PromptConversation>
  );
}
