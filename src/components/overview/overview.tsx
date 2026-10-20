"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlatformScope } from "@/components/overview/platform-scope";
import { PLATFORM_PARAM } from "@/lib/platform-scope";
import type { PlatformId } from "@/lib/snapshot";

/**
 * The overview: the platform scope and everything that scope filters.
 *
 * The selected Platform lives in local state, so the numbers recompute on
 * the click instead of after the navigation, and the URL carries it for
 * whoever the view is shared with.
 */
export function Overview({ platformId }: { platformId: PlatformId }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState(platformId);
  const [synced, setSynced] = useState(platformId);

  // The selection deliberately leads the prop: it changes on the click, while
  // the prop only changes when the server answers. So this compares the prop
  // with the last prop seen — never with the selection, which is ahead of it.
  if (platformId !== synced) {
    setSynced(platformId);
    setSelected(platformId);
  }

  function selectPlatform(next: PlatformId) {
    setSelected(next);
    const params = new URLSearchParams(searchParams);
    params.set(PLATFORM_PARAM, next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-tight">Northstar</h2>
        <PlatformScope
          platformId={selected}
          onPlatformChange={selectPlatform}
        />
      </div>
    </section>
  );
}
