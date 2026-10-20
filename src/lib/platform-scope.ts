import { snapshot } from "@/lib/snapshot";
import type { PlatformId } from "@/lib/snapshot";

/**
 * The platform scope: the one filter the overview, the chart, and the table
 * share. It lives in the URL, so a view of the dashboard is shareable.
 */

/** The search param that carries the selected Platform. */
export const PLATFORM_PARAM = "platform";

/**
 * The Platform the scope falls back to: the Snapshot's first Platform,
 * ChatGPT. Reading it from the fixture keeps one list of Platforms in the
 * app, so the default can never name a Platform the Snapshot drops.
 */
export const DEFAULT_PLATFORM_ID: PlatformId = snapshot.platforms[0].id;

/** Whether a raw value stands for one of the tracked Platforms. */
export function isPlatformId(value: string): value is PlatformId {
  return snapshot.platforms.some((platform) => platform.id === value);
}

/**
 * The tracked Platform a raw `platform` search param stands for.
 *
 * A missing, unknown, or repeated value falls back to the default Platform:
 * a hand-edited link has to render a view, and it must never select a
 * Platform the Snapshot does not track.
 */
export function resolvePlatformId(
  value: string | string[] | null | undefined,
): PlatformId {
  if (typeof value === "string" && isPlatformId(value)) return value;

  return DEFAULT_PLATFORM_ID;
}
