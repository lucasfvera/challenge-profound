import { Overview } from "@/components/overview/overview";
import { PLATFORM_PARAM, resolvePlatform } from "@/lib/platform-scope";
import type { PlatformSearchParams } from "@/lib/platform-scope";
import { PRODUCT_NAME } from "@/lib/site";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<PlatformSearchParams>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
        {PRODUCT_NAME} is a deterministic snapshot of how Northstar appears in
        AI answers.
      </p>
      <Overview platform={resolvePlatform(params[PLATFORM_PARAM])} />
    </main>
  );
}
