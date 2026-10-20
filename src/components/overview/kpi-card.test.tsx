import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { KpiCard } from "@/components/overview/kpi-card";
import { KPIS } from "@/components/overview/kpis";
import type { Kpi } from "@/components/overview/kpis";

/** The Visibility Score, reported as a percentage. */
const VISIBILITY_SCORE: Kpi = KPIS.visibilityScore;

/** The Average Position, reported in positions. */
const AVERAGE_POSITION: Kpi = KPIS.averagePosition;

/** The Share of Voice, reported as a percentage. */
const SHARE_OF_VOICE: Kpi = KPIS.shareOfVoice;

/** The accessible name the icon beside the Visibility Score carries. */
const TRIGGER_NAME = "What Visibility Score means";

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

  it("points the way the metric moved", () => {
    render(
      <>
        <KpiCard kpi={VISIBILITY_SCORE} value={42.5} delta={-3.2} />
        <KpiCard kpi={SHARE_OF_VOICE} value={30} delta={4.1} />
        <KpiCard kpi={VISIBILITY_SCORE} value={66.7} delta={0} />
      </>,
    );

    // The mark points the way the metric moved, and it carries that
    // direction as its name, so the shape is not a decoration a screen
    // reader skips.
    expect(screen.getByRole("img", { name: "Down" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Up" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "No change" })).toBeInTheDocument();
  });

  it("explains the metric behind the name", async () => {
    const user = userEvent.setup();

    render(<KpiCard kpi={VISIBILITY_SCORE} value={42.5} delta={-3.2} />);

    // The icon beside the name is the affordance that says there is more to
    // read, and it is named so a reader who cannot see the icon knows which
    // metric it explains.
    const trigger = screen.getByRole("button", { name: TRIGGER_NAME });

    await user.hover(trigger);

    // Hovering it opens the explanation the card carries for the metric, in
    // a popover that is a named dialog, so a screen reader reads it too.
    const popover = await screen.findByRole("dialog", {
      name: VISIBILITY_SCORE.label,
    });

    expect(popover).toHaveAccessibleDescription(VISIBILITY_SCORE.description);
  });

  it("opens the explanation for a reader who reaches the icon by keyboard", async () => {
    const user = userEvent.setup();

    render(<KpiCard kpi={VISIBILITY_SCORE} value={42.5} delta={-3.2} />);

    // The icon takes focus, so a reader who never points at anything can
    // still ask what the metric measures.
    await user.tab();

    const trigger = screen.getByRole("button", { name: TRIGGER_NAME });

    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");

    const popover = await screen.findByRole("dialog", {
      name: VISIBILITY_SCORE.label,
    });

    expect(popover).toHaveAccessibleDescription(VISIBILITY_SCORE.description);
  });
});
