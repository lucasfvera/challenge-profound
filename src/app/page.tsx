import { PRODUCT_NAME } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-start justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{PRODUCT_NAME}</h1>
      <p className="mt-2 text-sm text-neutral-400">
        A deterministic snapshot of how Northstar appears in AI answers.
      </p>
    </main>
  );
}
