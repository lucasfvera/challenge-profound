import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { KPIS } from "@/components/overview/kpis";
import { PlatformStandings } from "@/components/overview/platform-standings";
import type { Platform, PlatformId } from "@/lib/snapshot";

/** The name the podium's list carries. */
const STANDINGS_LIST = "Brand standings";

/** The metric the podium ranks by. */
const VISIBILITY_SCORE = KPIS.visibilityScore.label;

/** The Visibility Score the Platform that leads the podium reaches. */
const LEADER_SCORE = "73.3%";

/** The Visibility Score the Platform that comes last reaches. */
const LAST_SCORE = "26.7%";

/** The podium, held in state the way the overview holds the scope. */
function Podium({ onPick }: { onPick?: (platform: Platform) => void }) {
  const [platformId, setPlatformId] = useState<PlatformId>("chatgpt");

  return (
    <PlatformStandings
      platformId={platformId}
      onPlatformChange={(platform) => {
        setPlatformId(platform.id);
        onPick?.(platform);
      }}
    />
  );
}

/** The rows of the podium, in the order it ranks them. */
function rows() {
  const list = screen.getByRole("list", { name: STANDINGS_LIST });

  return within(list).getAllByRole("button");
}

/** The row of the podium that stands for one Platform. */
function rowFor(platform: string) {
  return screen.getByRole("button", { name: new RegExp(`^${platform},`) });
}

describe("the platform standings", () => {
  it("ranks the platforms by how often they name the brand", () => {
    render(<Podium />);

    const standings = rows();

    expect(standings).toHaveLength(4);
    expect(standings[0]).toHaveAccessibleName(
      `Claude, rank 1, ${LEADER_SCORE} ${VISIBILITY_SCORE}`,
    );
    expect(standings[1]).toHaveAccessibleName(
      `ChatGPT, rank 2, 66.7% ${VISIBILITY_SCORE}`,
    );
    expect(standings[2]).toHaveAccessibleName(
      `Gemini, rank 3, 53.3% ${VISIBILITY_SCORE}`,
    );
    expect(standings[3]).toHaveAccessibleName(
      `Perplexity, rank 4, ${LAST_SCORE} ${VISIBILITY_SCORE}`,
    );
  });

  it("shows the score the platform reaches", () => {
    render(<Podium />);

    expect(within(rowFor("Claude")).getByText(LEADER_SCORE)).toBeInTheDocument();
    expect(within(rowFor("Perplexity")).getByText(LAST_SCORE)).toBeInTheDocument();
  });

  it("says which platform the view is scoped to", () => {
    render(<Podium />);

    expect(rowFor("ChatGPT")).toHaveAttribute("aria-pressed", "true");
    expect(rowFor("Claude")).toHaveAttribute("aria-pressed", "false");
  });

  it("picks the platform the reader clicks", async () => {
    const user = userEvent.setup();

    render(<Podium />);

    await user.click(rowFor("Gemini"));

    expect(rowFor("Gemini")).toHaveAttribute("aria-pressed", "true");
    expect(rowFor("ChatGPT")).toHaveAttribute("aria-pressed", "false");
  });

  it("leaves the scope alone when the reader picks the platform it is already on", async () => {
    const user = userEvent.setup();
    const picked = vi.fn();

    render(<Podium onPick={picked} />);

    await user.click(rowFor("ChatGPT"));

    expect(picked).not.toHaveBeenCalled();
  });
});
