import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CitationsPanel } from "@/components/prompts/citations-panel";
import { findAnswer } from "@/lib/prompt-detail";
import type { Citation } from "@/lib/snapshot";

/** The Answer the Snapshot holds for the first tracked Prompt on ChatGPT. */
const answer = findAnswer("p-01", "chatgpt");
if (!answer) throw new Error("missing the ChatGPT answer for p-01");

/** A source the Snapshot cites. */
const linked = answer.citations[0];

/**
 * A source whose URL the link policy refuses.
 *
 * The Snapshot cites nothing like it, so the panel is given one to show what
 * it does with a URL it cannot open.
 */
const refused: Citation = {
  id: "c-12",
  title: "A Source That Is Not A Link",
  url: "javascript:alert(1)",
  publisher: "Nowhere",
};

describe("the citations panel", () => {
  it("names every source and links only the ones it can open safely", () => {
    render(<CitationsPanel citations={[linked, refused]} />);

    // A source is a link named after the source, and the name says that it
    // opens in a new tab.
    const link = screen.getByRole("link", {
      name: (name) =>
        name.startsWith(linked.title) && name.includes("(opens in a new tab)"),
    });

    // The link carries the attributes that make it safe to open.
    expect(link).toHaveAttribute("href", linked.url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    // A source the policy refuses is read, not linked.
    expect(
      screen.queryByRole("link", { name: /A Source That Is Not A Link/ }),
    ).toBeNull();
    expect(screen.getByText("A Source That Is Not A Link")).toBeInTheDocument();
  });
});
