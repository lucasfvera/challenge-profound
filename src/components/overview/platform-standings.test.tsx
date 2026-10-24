import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { KPIS } from "@/components/overview/kpis";
import { PlatformStandings } from "@/components/overview/platform-standings";
import type { Platform, PlatformId } from "@/lib/snapshot";

/** The name the podium's list carries. */
const STANDINGS_LIST = "Brand standings";

/** The metric the podium orders by. */
const VISIBILITY_SCORE = KPIS.visibilityScore.label;

/** The Platforms the podium stands for. */
const CLAUDE = "Claude";
const CHATGPT = "ChatGPT";
const GEMINI = "Gemini";
const PERPLEXITY = "Perplexity";

/** The Visibility Scores the podium shows. */
const LEADER_SCORE = "73.3%";
const SECOND_SCORE = "66.7%";
const THIRD_SCORE = "53.3%";
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

/** The rows of the podium, in the order it holds them. */
function rows() {
  const list = screen.getByRole("list", { name: STANDINGS_LIST });

  return within(list).getAllByRole("button");
}

/** The row of the podium that stands for one Platform. */
function rowFor(platform: string) {
  return screen.getByRole("button", { name: new RegExp(`^${platform},`) });
}

describe("the platform standings", () => {
  it("orders the platforms by how often they name the brand", () => {
    render(<Podium />);

    const standings = rows();

    expect(standings).toHaveLength(4);
    expect(standings[0]).toHaveAccessibleName(
      `${CLAUDE}, place 1, ${LEADER_SCORE} ${VISIBILITY_SCORE}`,
    );
    expect(standings[1]).toHaveAccessibleName(
      `${CHATGPT}, place 2, ${SECOND_SCORE} ${VISIBILITY_SCORE}`,
    );
    expect(standings[2]).toHaveAccessibleName(
      `${GEMINI}, place 3, ${THIRD_SCORE} ${VISIBILITY_SCORE}`,
    );
    expect(standings[3]).toHaveAccessibleName(
      `${PERPLEXITY}, place 4, ${LAST_SCORE} ${VISIBILITY_SCORE}`,
    );
  });

  it("shows the score the platform reaches", () => {
    render(<Podium />);

    expect(within(rowFor(CLAUDE)).getByText(LEADER_SCORE)).toBeInTheDocument();
    expect(
      within(rowFor(PERPLEXITY)).getByText(LAST_SCORE),
    ).toBeInTheDocument();
  });

  it("says which platform the view is scoped to", () => {
    render(<Podium />);

    expect(rowFor(CHATGPT)).toHaveAttribute("aria-pressed", "true");
    expect(rowFor(CLAUDE)).toHaveAttribute("aria-pressed", "false");
  });

  it("picks the platform the reader clicks", async () => {
    const user = userEvent.setup();

    render(<Podium />);

    await user.click(rowFor(GEMINI));

    expect(rowFor(GEMINI)).toHaveAttribute("aria-pressed", "true");
    expect(rowFor(CHATGPT)).toHaveAttribute("aria-pressed", "false");
  });

  it("leaves the scope alone when the reader picks the platform it is already on", async () => {
    const user = userEvent.setup();
    const picked = vi.fn();

    render(<Podium onPick={picked} />);

    await user.click(rowFor(CHATGPT));

    expect(picked).not.toHaveBeenCalled();
  });
});
