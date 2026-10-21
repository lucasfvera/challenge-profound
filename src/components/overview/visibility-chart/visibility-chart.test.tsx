import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VisibilityChart } from "@/components/overview/visibility-chart/visibility-chart";

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
 * A series' reference: the sample it draws, and the line it draws it with.
 *
 * The reference is a sample of the line it names, so the line is where the
 * series' treatment is drawn.
 */
function referenceOf(button: HTMLElement) {
  const reference = button.querySelector("svg");
  if (!reference) throw new Error("the series reference drew no sample");

  const line = reference.querySelector("line");
  if (!line) throw new Error("the series reference drew no line");

  return { reference, line };
}

/**
 * The size a series' reference is drawn at: the space its dash is drawn in,
 * how long the dash pattern takes, and the width of the line it samples.
 *
 * The reference has to carry a whole dash pattern: a sample too short for
 * the pattern cuts the dash that tells the series apart.
 */
function referenceSample(button: HTMLElement) {
  const { reference, line } = referenceOf(button);

  // The space the dash is drawn in is the sample's own viewBox: the width
  // it declares is the width the pattern has to fit in.
  const space = reference.getAttribute("viewBox")?.split(" ").map(Number) ?? [];
  const width = space[2];

  const dash = line.getAttribute("stroke-dasharray");
  const cycle = (dash ?? "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .reduce((sum, part) => sum + part, 0);

  const strokeWidth = line.getAttribute("stroke-width");
  if (strokeWidth === null) {
    throw new Error("the series reference drew no stroke width");
  }

  return { width, cycle, strokeWidth: Number(strokeWidth) };
}

/**
 * The widths the plot's series are drawn with.
 *
 * The plot's lines are drawings with no name of their own, so the suite takes
 * them through the markup they are drawn in — the same way it reads the
 * reference each legend toggle wears.
 */
function plottedWidths(container: HTMLElement) {
  return [...container.querySelectorAll("path.recharts-line-curve")].map(
    (line) => Number(line.getAttribute("stroke-width")),
  );
}

/**
 * The colour a series' reference is drawn with.
 *
 * The reference draws its colour as a token, and the unit environment does
 * not resolve a custom property, so the token is what the suite reads here.
 * The smoke suite reads the colour the bundle resolves it to.
 */
function referenceStroke(button: HTMLElement) {
  const { line } = referenceOf(button);
  const stroke = line.getAttribute("stroke");
  if (stroke === null) throw new Error("the series reference drew no stroke");

  return stroke;
}

/**
 * The colours the series of one group are drawn with.
 *
 * The group is read the way a reader reaches it: the brand's group and the
 * competitors' group, each named by the label it shows.
 */
function groupStrokes(group: HTMLElement) {
  return within(group).getAllByRole("button").map(referenceStroke);
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
    const samples = within(legend).getAllByRole("button").map(referenceSample);

    // The reference is what names the line, so it has to carry a whole dash
    // pattern: a sample too short for the pattern cuts the dash that tells
    // the series apart.
    expect(samples.filter(({ cycle, width }) => cycle > width)).toEqual([]);
  });

  it("groups the brand and the competitors in the legend", () => {
    vi.stubGlobal("ResizeObserver", MeasuredResizeObserver);

    render(<VisibilityChart platformId="chatgpt" />);

    const legend = screen.getByRole("group", { name: "Series" });
    const brand = within(legend).getByRole("group", { name: "Your brand" });
    const competitors = within(legend).getByRole("group", {
      name: "Competitors",
    });

    // The brand the reader is measuring is named in words, and so are the
    // rivals: the distinction does not rest on the colour of a line.
    expect(
      within(brand)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Northstar"]);

    expect(
      within(competitors)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Lumen", "Vantage", "Arcadia"]);
  });

  it("draws the brand's line heavier than every competitor's", () => {
    vi.stubGlobal("ResizeObserver", MeasuredResizeObserver);

    const { container } = render(<VisibilityChart platformId="chatgpt" />);

    const legend = screen.getByRole("group", { name: "Series" });
    const brand = referenceSample(
      within(legend).getByRole("button", { name: "Northstar" }),
    );

    // The rivals are the ones the legend groups as competitors, so the
    // promise covers every competitor the Snapshot tracks and not a list of
    // names that can drift away from it.
    const competitors = within(
      within(legend).getByRole("group", { name: "Competitors" }),
    ).getAllByRole("button");

    for (const competitor of competitors) {
      expect(referenceSample(competitor).strokeWidth).toBeLessThan(
        brand.strokeWidth,
      );
    }

    // The plot draws the weight the reference wears: the brand's line is the
    // heaviest one on it, and it is the only line that wears that weight.
    const plotted = plottedWidths(container);

    expect(plotted).toHaveLength(competitors.length + 1);
    expect(plotted.filter((width) => width === brand.strokeWidth)).toHaveLength(
      1,
    );
    expect(Math.max(...plotted)).toBe(brand.strokeWidth);
  });

  it("takes the hue off the competitors and leaves the brand alone", async () => {
    vi.stubGlobal("ResizeObserver", MeasuredResizeObserver);

    const user = userEvent.setup();

    render(<VisibilityChart platformId="chatgpt" />);

    const toggle = screen.getByRole("switch", { name: "Greyscale" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    const legend = screen.getByRole("group", { name: "Series" });
    const brand = within(legend).getByRole("group", { name: "Your brand" });
    const competitors = within(legend).getByRole("group", {
      name: "Competitors",
    });

    const brandBefore = groupStrokes(brand);
    const competitorsBefore = groupStrokes(competitors);

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");

    // The brand keeps its colour: the mode takes the hue off the competitors
    // only, so the brand's line is the one hue left on the plot.
    expect(groupStrokes(brand)).toEqual(brandBefore);

    const competitorsAfter = groupStrokes(competitors);

    for (const [index, stroke] of competitorsAfter.entries()) {
      expect(stroke).not.toBe(competitorsBefore[index]);
    }

    // The rivals are still told apart: the greyscale ramp is a ramp of its
    // own, so no two of them wear the same grey.
    expect(new Set(competitorsAfter).size).toBe(competitorsAfter.length);

    // And the mode is a toggle, not a one-way switch: the rivals wear their
    // hue again when the reader switches it off.
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(groupStrokes(brand)).toEqual(brandBefore);
    expect(groupStrokes(competitors)).toEqual(competitorsBefore);
  });
});
