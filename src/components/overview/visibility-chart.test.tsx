import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VisibilityChart } from "@/components/overview/visibility-chart";

/** The size the chart's container is measured at. */
const WIDTH = 800;
const HEIGHT = 320;

/**
 * The x the first tracked day is hovered at.
 *
 * The chart's vertical axis is 44 wide, so the first day is drawn just
 * right of that. The hover has to stay inside the plot area: Recharts
 * clears the tooltip outside it.
 */
const FIRST_DAY_X = 48;

/**
 * A `ResizeObserver`, which jsdom does not have.
 *
 * Recharts reads the size of its container from the observer, and jsdom has
 * no layout to read it from, so this one reports the size the chart is
 * drawn at.
 */
class MeasuredResizeObserver implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element): void {
    const size: ResizeObserverSize = {
      inlineSize: WIDTH,
      blockSize: HEIGHT,
    };

    this.callback(
      [
        {
          target,
          contentRect: new DOMRectReadOnly(0, 0, WIDTH, HEIGHT),
          borderBoxSize: [size],
          contentBoxSize: [size],
          devicePixelContentBoxSize: [size],
        },
      ],
      this,
    );
  }

  unobserve(): void {}

  disconnect(): void {}
}

/**
 * The size of a series' reference: the space its dash is drawn in, and how
 * long the dash pattern takes.
 *
 * The reference has to carry a whole dash pattern: a sample too short for
 * the pattern cuts the dash that tells the series apart.
 */
function referenceSample(button: HTMLElement) {
  const reference = button.querySelector("svg");
  if (!reference) throw new Error("the series reference drew no sample");

  // The space the dash is drawn in is the sample's own viewBox: the width
  // it declares is the width the pattern has to fit in.
  const space = reference.getAttribute("viewBox")?.split(" ").map(Number) ?? [];
  const width = space[2];

  const dash = reference
    .querySelector("line")
    ?.getAttribute("stroke-dasharray");
  const cycle = (dash ?? "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .reduce((sum, part) => sum + part, 0);

  return { width, cycle };
}

describe("the chart", () => {
  it("names every series and shows the tracked score of the hovered day", async () => {
    vi.stubGlobal("ResizeObserver", MeasuredResizeObserver);

    const user = userEvent.setup();

    const { container } = render(<VisibilityChart platformId="chatgpt" />);

    // The legend names the series the Snapshot tracks, and every one of them
    // is drawn.
    const legend = screen.getByRole("group", { name: "Series" });
    const northstar = within(legend).getByRole("button", { name: "Northstar" });

    expect(northstar).toHaveAttribute("aria-pressed", "true");
    expect(
      within(legend)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Northstar", "Lumen", "Vantage", "Arcadia"]);

    // The plot is the chart's own drawing, and Recharts gives it no role of
    // its own, so it is the one element the hover reaches for.
    const plot = container.querySelector(".recharts-wrapper");
    if (!plot) throw new Error("the chart drew no plot");

    await user.pointer({ target: plot, coords: { x: FIRST_DAY_X, y: 150 } });

    await act(async () => {
      // Recharts reads the hover on the next frame.
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    // The tooltip reads the day and the exact score of every series on it.
    const readings = within(screen.getByRole("list")).getAllByRole("listitem");

    expect(readings).toHaveLength(4);
    expect(screen.getByText("Sep 1, 2026")).toBeInTheDocument();
    expect(readings[0]).toHaveTextContent(/Northstar.*46\.7%/);
    expect(readings[1]).toHaveTextContent(/Lumen.*53\.3%/);
    expect(readings[2]).toHaveTextContent(/Vantage.*26\.7%/);
    expect(readings[3]).toHaveTextContent(/Arcadia.*26\.7%/);
  });

  it("gives every series a reference that carries its own dash", () => {
    vi.stubGlobal("ResizeObserver", MeasuredResizeObserver);

    render(<VisibilityChart platformId="chatgpt" />);

    const legend = screen.getByRole("group", { name: "Series" });
    const samples = within(legend)
      .getAllByRole("button")
      .map(referenceSample);

    // The reference is what names the line, so it has to carry a whole dash
    // pattern: a sample too short for the pattern cuts the dash that tells
    // the series apart.
    expect(samples.filter(({ cycle, width }) => cycle > width)).toEqual([]);
  });
});
