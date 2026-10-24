import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PromptDetailLayout } from "@/components/prompts/prompt-detail-layout";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * The detail route's loading skeleton: the placeholders that hold the page
 * while the content for the current URL is on its way.
 *
 * It stands in for the content inside the route's own layout — an answer
 * panel and a citations panel — so the page does not jump when the content
 * arrives. The skeleton is inert, the way the base component is: it has no
 * interactive states, only the placeholder blocks.
 */
export function PromptDetailSkeleton() {
  return (
    <PromptDetailLayout>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-11/12" />
        </CardContent>
      </Card>
    </PromptDetailLayout>
  );
}
