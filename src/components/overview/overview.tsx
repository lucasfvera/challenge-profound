"use client";

import { KpiCard } from "@/components/overview/kpi-card";
import type { Kpi } from "@/components/overview/kpi-card";
import { VisibilityChart } from "@/components/overview/visibility-chart";
import { PlatformScope } from "@/components/platform-scope";
import { snapshot, subjectMetrics } from "@/lib/snapshot";
import type { Platform } from "@/lib/snapshot";
import { usePlatformScope } from "@/lib/use-platform-scope";

/** The metrics the overview reports, with the unit each one is reported in. */
const KPIS = {
  visibilityScore: { label: "Visibility Score", unit: "percent" },
  shareOfVoice: { label: "Share of Voice", unit: "percent" },
  averagePosition: { label: "Average Position", unit: "position" },
} as const satisfies Record<string, Kpi>;

/**
 * The overview: the platform scope and everything that scope filters.
 *
 * The selected Platform lives in local state, so the numbers recompute on
 * the click instead of after the navigation, and the URL carries it for
 * whoever the view is shared with.
 */
export function Overview({ platform }: { platform: Platform }) {
  const { selected, select } = usePlatformScope(platform);

  const kpis = subjectMetrics(snapshot, selected.id);

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-tight">Northstar</h2>
        <PlatformScope
          platformId={selected.id}
          onPlatformChange={select}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          kpi={KPIS.visibilityScore}
          value={kpis.visibilityScore}
          delta={kpis.visibilityTrend}
        />
        <KpiCard
          kpi={KPIS.shareOfVoice}
          value={kpis.shareOfVoice}
          delta={kpis.shareOfVoiceTrend}
        />
        <KpiCard
          kpi={KPIS.averagePosition}
          value={kpis.averagePosition}
          delta={kpis.averagePositionTrend}
        />
      </div>
      <div className="mt-6">
        <VisibilityChart platformId={selected.id} />
      </div>
    </section>
  );
}
