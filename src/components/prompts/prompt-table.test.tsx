import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PromptTable } from "@/components/prompts/prompt-table";

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
});
