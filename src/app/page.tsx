import { PRODUCT_NAME } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
        {PRODUCT_NAME} is a deterministic snapshot of how Northstar appears in
        AI answers.
      </p>
    </main>
  );
}
