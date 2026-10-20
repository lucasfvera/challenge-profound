import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnswerPanel } from "@/components/prompts/answer-panel";
import { snapshot } from "@/lib/snapshot";

/**
 * The Answer the Snapshot holds for the first tracked Prompt on ChatGPT.
 *
 * It names Northstar once and two of the competitors, so the panel's
 * highlights can be counted.
 */
const answer = snapshot.answers.find(
  (entry) => entry.promptId === "p-01" && entry.platformId === "chatgpt",
);
if (!answer) throw new Error("missing the ChatGPT answer for p-01");

describe("the answer panel", () => {
  it("labels every mention it highlights, and counts them", () => {
    render(<AnswerPanel answer={answer} brands={snapshot.brands} />);

    // The label a screen reader reads says which brand a mention names, and
    // whether it is the brand being measured.
    expect(screen.getAllByText("(the brand being measured)")).toHaveLength(1);
    expect(screen.getAllByText("(competitor)")).toHaveLength(2);

    // The body reads the brand and its label together.
    expect(screen.getByText("Northstar")).toHaveTextContent(
      "Northstar (the brand being measured)",
    );
    expect(screen.getByText("Lumen")).toHaveTextContent("Lumen (competitor)");
    expect(screen.getByText("Arcadia")).toHaveTextContent(
      "Arcadia (competitor)",
    );
  });
});
