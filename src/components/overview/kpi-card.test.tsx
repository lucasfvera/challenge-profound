import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KpiCard } from "@/components/overview/kpi-card";
import type { Kpi } from "@/components/overview/kpi-card";

/** The Visibility Score, reported as a percentage. */
const VISIBILITY_SCORE: Kpi = { label: "Visibility Score", unit: "percent" };

/** The Average Position, reported in positions. */
const AVERAGE_POSITION: Kpi = { label: "Average Position", unit: "position" };

/** The Share of Voice, reported as a percentage. */
const SHARE_OF_VOICE: Kpi = { label: "Share of Voice", unit: "percent" };

describe("the KPI card", () => {
  it("spells the movement out for a reader who cannot see the colour", () => {
    render(
      <>
        <KpiCard kpi={VISIBILITY_SCORE} value={42.5} delta={-3.2} />
        <KpiCard kpi={AVERAGE_POSITION} value={1.5} delta={-1.5} />
        <KpiCard kpi={SHARE_OF_VOICE} value={30} delta={0} />
        <KpiCard kpi={VISIBILITY_SCORE} value={66.7} delta={null} />
      </>,
    );

    // A movement down is said in words, in the metric's own unit.
    expect(screen.getByText("42.5%")).toBeInTheDocument();
    expect(screen.getByText("Down 3.2 pts")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Down 3.2 points versus the first half of the tracked window.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Down 1.5 positions")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Down 1.5 positions versus the first half of the tracked window.",
      ),
    ).toBeInTheDocument();

    // A movement of nothing says so.
    expect(screen.getByText("No change")).toBeInTheDocument();
    expect(
      screen.getByText("No change over the tracked window."),
    ).toBeInTheDocument();

    // A movement the Snapshot cannot report says so, and shows the design
    // system's mark for a missing number.
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(
      screen.getByText("No earlier period to compare."),
    ).toBeInTheDocument();
  });
});
