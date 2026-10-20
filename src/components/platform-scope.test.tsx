import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { PlatformScope } from "@/components/platform-scope";
import type { PlatformId } from "@/lib/snapshot";

/** The scope control, held in state the way the overview holds it. */
function Scope() {
  const [platformId, setPlatformId] = useState<PlatformId>("chatgpt");

  return (
    <PlatformScope
      platformId={platformId}
      onPlatformChange={(platform) => setPlatformId(platform.id)}
    />
  );
}

describe("the platform scope control", () => {
  it("moves between the platforms with the arrow keys and says which one is selected", async () => {
    const user = userEvent.setup();

    render(<Scope />);

    const group = screen.getByRole("group", { name: "Platform" });
    const chatgpt = screen.getByRole("button", { name: "ChatGPT" });
    const claude = screen.getByRole("button", { name: "Claude" });

    expect(chatgpt).toHaveAttribute("aria-pressed", "true");
    expect(claude).toHaveAttribute("aria-pressed", "false");
    expect(group).toContainElement(chatgpt);

    await user.tab();

    expect(chatgpt).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(claude).toHaveFocus();
    expect(claude).toHaveAttribute("aria-pressed", "true");
    expect(chatgpt).toHaveAttribute("aria-pressed", "false");
  });
});
