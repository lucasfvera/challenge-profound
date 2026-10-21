import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PromptTable } from "@/components/prompts/prompt-table";

/**
 * The mark drawn beside a piece of the key's copy.
 *
 * A mark is a drawing with no name of its own, so it is read through the
 * markup it is drawn in — the way the smoke suite reads the chart's series
 * references.
 */
function markBeside(copy: string) {
  return screen.getByText(copy).querySelector("[data-mention-position]");
}

describe("the prompt table", () => {
  it("opens a row's detail with Enter and with Space", async () => {
    const user = userEvent.setup();

    render(<PromptTable platformId="chatgpt" />);

    // The row is a link into the detail route, and it carries the Platform
    // the table is scoped to.
    const table = screen.getByRole("table");
    const row = within(table).getByRole("link", {
      name: /best AI visibility analytics tools/,
    });

    expect(row).toHaveAttribute("href", "/prompts/p-01?platform=chatgpt");

    const opened = vi.fn();
    row.addEventListener("click", (event) => {
      event.preventDefault();
      opened();
    });

    // The card layout below the small breakpoint renders the same links
    // earlier in the document, so the row is focused directly rather than
    // reached by tabbing.
    row.focus();

    await user.keyboard("{Enter}");

    expect(opened).toHaveBeenCalledTimes(1);

    // Space opens the row too, which a link does not do on its own.
    await user.keyboard(" ");

    expect(opened).toHaveBeenCalledTimes(2);
  });

  it("names the position that named the brand first", () => {
    render(<PromptTable platformId="chatgpt" />);

    const table = screen.getByRole("table");

    // The mark a cell wears is a drawing, and the number alone does not say
    // the brand was named before the others: the label a screen reader reads
    // says it, so the difference is in the words and not only in the mark.
    const first = within(table).queryAllByRole("cell", {
      name: /at position 1\. The brand was named first\./,
    });
    const later = within(table).queryAllByRole("cell", {
      name: /at position (?:[2-9]|\d{2,})\./,
    });

    expect(first.length).toBeGreaterThan(0);
    expect(later.length).toBeGreaterThan(0);
  });

  it("the key says what the number means", () => {
    render(<PromptTable platformId="chatgpt" />);

    // The number on a Mention is a position, and a reader who does not know
    // that cannot read the table: the key names the metric, says what the
    // number is, and names the two marks the cells wear.
    expect(screen.getByText("Position")).toBeInTheDocument();
    expect(
      screen.getByText("the place Northstar was named in the Platform's answer"),
    ).toBeInTheDocument();
    expect(screen.getByText("named first")).toBeInTheDocument();
    expect(screen.getByText("named after another brand")).toBeInTheDocument();

    // The key draws the marks it names, so a reader can decode the table.
    // A mark is a drawing with no name of its own, so it is read through
    // the markup it is drawn in.
    expect(markBeside("named first")).toHaveAttribute(
      "data-mention-position",
      "first",
    );
    expect(markBeside("named after another brand")).toHaveAttribute(
      "data-mention-position",
      "later",
    );
  });
});
