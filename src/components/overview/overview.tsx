"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { KpiCard } from "@/components/overview/kpi-card";
import { PlatformScope } from "@/components/overview/platform-scope";
import { PLATFORM_PARAM } from "@/lib/platform-scope";
import { snapshot, subjectMetrics } from "@/lib/snapshot";
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

  const kpis = subjectMetrics(snapshot, selected);

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-tight">Northstar</h2>
        <PlatformScope
          platformId={selected}
          onPlatformChange={selectPlatform}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Visibility Score"
          value={kpis.visibilityScore}
          unit="percent"
          delta={kpis.visibilityTrend}
        />
        <KpiCard
          label="Share of Voice"
          value={kpis.shareOfVoice}
          unit="percent"
          delta={kpis.shareOfVoiceTrend}
        />
        <KpiCard
          label="Average Position"
          value={kpis.averagePosition}
          unit="position"
          delta={kpis.averagePositionTrend}
        />
      </div>
    </section>
  );
}
