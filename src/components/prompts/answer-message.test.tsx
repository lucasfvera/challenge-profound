import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnswerMessage } from "@/components/prompts/answer-message";
import { findAnswer } from "@/lib/prompt-detail";
import { snapshot } from "@/lib/snapshot";
import type { Answer, Citation } from "@/lib/snapshot";

/** The name the Platform's message carries. */
const PLATFORM_SPEAKER = "ChatGPT answered";

/**
 * The Answer the Snapshot holds for the first tracked Prompt on ChatGPT.
 *
 * It names Northstar once and two of the competitors, so the message's
 * highlights can be counted.
 */
const answer = findAnswer("p-01", "chatgpt");
if (!answer) throw new Error("missing the ChatGPT answer for p-01");

/** A source the Snapshot cites. */
const linked = answer.citations[0];

/**
 * A source whose URL the link policy refuses.
 *
 * The Snapshot cites nothing like it, so the message is given one to show
 * what it does with a URL it cannot open. The id is one the Snapshot's own
 * citations use — the ids are a closed set — and nothing renders both.
 */
const refused: Citation = {
  id: "c-12",
  title: "A Source That Is Not A Link",
  url: "javascript:alert(1)",
  publisher: "Nowhere",
};

/** The Answer with a second source the policy refuses. */
const answerWithRefused: Answer = {
  ...answer,
  citations: [linked, refused],
};

describe("the platform's message", () => {
  it("labels every mention it highlights, and counts them", () => {
    render(
      <AnswerMessage
        label={PLATFORM_SPEAKER}
        answer={answer}
        brands={snapshot.brands}
      />,
    );

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

  it("lists the citations the answer used", () => {
    render(
      <AnswerMessage
        label={PLATFORM_SPEAKER}
        answer={answer}
        brands={snapshot.brands}
      />,
    );

    expect(screen.getByText("Citations")).toBeInTheDocument();
    expect(screen.getByText(linked.title)).toBeInTheDocument();
  });

  it("names every source and links only the ones it can open safely", () => {
    render(
      <AnswerMessage
        label={PLATFORM_SPEAKER}
        answer={answerWithRefused}
        brands={snapshot.brands}
      />,
    );

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

    // A source the policy refuses is read, not linked: no link in the
    // message points at the URL it cannot open.
    expect(screen.getByText("A Source That Is Not A Link")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link")
        .map((anchor) => anchor.getAttribute("href")),
    ).not.toContain(refused.url);
  });

  it("points every marker in the body at its own citation", () => {
    render(
      <AnswerMessage
        label={PLATFORM_SPEAKER}
        answer={answer}
        brands={snapshot.brands}
      />,
    );

    // Every marker in the body lands on the entry that carries the same
    // number, so the number in the body is the number in the list.
    answer.citations.forEach((citation, index) => {
      const marker = screen.getByRole("link", {
        name: `[${index + 1}] ${citation.title}`,
      });
      const href = marker.getAttribute("href") ?? "";

      expect(document.querySelector(href)).toHaveTextContent(citation.title);
    });
  });
});
