import { describe, expect, it } from "vitest";
import { formatDate, formatDay, formatPeriod } from "@/lib/dates";

describe("the app's dates", () => {
  it("writes a tracked day without moving it", () => {
    expect(formatDay("2026-09-01")).toBe("Sep 1");
    expect(formatDay("2026-09-30")).toBe("Sep 30");
  });

  it("keeps a tracked day on its own calendar day", () => {
    // A day parsed into a timestamp would slip to the day before in the
    // time zones behind UTC, and to the day after in the ones ahead of it.
    expect(formatDay("2026-01-01")).toBe("Jan 1");
    expect(formatDay("2026-12-31")).toBe("Dec 31");
  });

  it("heads a day with its year", () => {
    expect(formatDate("2026-09-30")).toBe("Sep 30, 2026");
  });

  it("describes the tracked window", () => {
    expect(
      formatPeriod({ start: "2026-09-01", end: "2026-09-30" }),
    ).toBe("Sep 1 – Sep 30, 2026");
  });
});
