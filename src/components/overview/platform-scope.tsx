"use client";

import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { isPlatformId } from "@/lib/platform-scope";
import { snapshot } from "@/lib/snapshot";
import type { PlatformId } from "@/lib/snapshot";

/**
 * The platform scope control: the one filter the overview, the chart, and
 * the table share.
 *
 * It is the segmented control the design system locked in — a single-select
 * toggle group whose segment carries `aria-pressed` — bound to the Platforms
 * the Snapshot tracks. The group carries the accessible name; each segment
 * is named by its own label.
 *
 * The scope follows the focus the way a radio group behaves: the arrow keys
 * move between the platforms and the filter changes with them. The selected
 * Platform holds the group's single tab stop, so tabbing into the control
 * lands on it and leaves the scope alone.
 */
export function PlatformScope({
  platformId,
  onPlatformChange,
}: {
  platformId: PlatformId;
  onPlatformChange: (platformId: PlatformId) => void;
}) {
  function select(next: PlatformId) {
    if (next !== platformId) onPlatformChange(next);
  }

  return (
    <SegmentedControl
      value={[platformId]}
      onValueChange={(values) => {
        const next = values[0];
        if (isPlatformId(next)) select(next);
      }}
      aria-label="Platform"
    >
      {snapshot.platforms.map((platform) => (
        <SegmentedControlItem
          key={platform.id}
          value={platform.id}
          tabIndex={platform.id === platformId ? 0 : -1}
          onFocus={() => select(platform.id)}
        >
          {platform.name}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
