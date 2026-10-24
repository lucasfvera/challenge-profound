import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PromptDetail } from "@/components/prompts/prompt-detail";
import { platformById } from "@/lib/snapshot/platforms";
import { usePlatformScope } from "@/lib/use-platform-scope";

vi.mock("@/lib/use-platform-scope", () => ({
  usePlatformScope: vi.fn(),
}));

const scope = vi.mocked(usePlatformScope);

/** The content the server rendered for the Platform the URL names. */
const ANSWER = <p>The Answer the Platform gave</p>;

describe("the detail route's client boundary", () => {
  it("holds the content while the next answer is on its way", () => {
    scope.mockReturnValue({
      selected: platformById("gemini"),
      select: vi.fn(),
      isPending: true,
    });

    render(
      <PromptDetail platform={platformById("chatgpt")} asOf="2026-09-30">
        {ANSWER}
      </PromptDetail>,
    );

    // The scope is a navigation, so the content is held while the server
    // answers: the page never shows one Platform's Answer under another's
    // name.
    expect(screen.queryByText("The Answer the Platform gave")).toBeNull();
    expect(
      screen.getByRole("list", { name: "Conversation" }),
    ).toBeInTheDocument();
  });

  it("shows the content once the answer has arrived", () => {
    scope.mockReturnValue({
      selected: platformById("gemini"),
      select: vi.fn(),
      isPending: false,
    });

    render(
      <PromptDetail platform={platformById("chatgpt")} asOf="2026-09-30">
        {ANSWER}
      </PromptDetail>,
    );

    expect(screen.getByText("The Answer the Platform gave")).toBeInTheDocument();
  });
});
