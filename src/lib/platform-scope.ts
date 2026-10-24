import { PLATFORMS, platformById } from "@/lib/snapshot/platforms";
import type { Platform, PlatformId } from "@/lib/snapshot";

/**
 * The platform scope: the one filter the overview, the detail route, and the
 * table share. It lives in the URL, so a view of the dashboard is shareable.
 */

/** The search param that carries the selected Platform. */
export const PLATFORM_PARAM = "platform";

/** The search params the platform scope reads from the URL. */
export type PlatformSearchParams = {
  [K in typeof PLATFORM_PARAM]?: string | string[];
};

/**
 * The Platform the scope falls back to: the Snapshot's first Platform,
 * ChatGPT. Reading it from the tracked list keeps one list of Platforms in
 * the app, so the default can never name a Platform the Snapshot drops.
 */
export const DEFAULT_PLATFORM: Platform = PLATFORMS[0];

/** Whether a raw value stands for one of the tracked Platforms. */
export function isPlatformId(value: string | undefined): value is PlatformId {
  return PLATFORMS.some((platform) => platform.id === value);
}

/**
 * The tracked Platform a raw `platform` search param stands for.
 *
 * A missing, unknown, or repeated value falls back to the default Platform:
 * a hand-edited link has to render a view, and it must never select a
 * Platform the Snapshot does not track.
 */
export function resolvePlatform(
  value: string | string[] | null | undefined,
): Platform {
  if (typeof value === "string" && isPlatformId(value)) {
    return platformById(value);
  }

  return DEFAULT_PLATFORM;
}

/**
 * The URL that carries a Platform scope.
 *
 * The other search params are kept: the scope is one filter among the
 * view's state, and it must not drop the rest of it.
 */
export function platformScopeHref(
  pathname: string,
  searchParams: URLSearchParams,
  platformId: PlatformId,
): string {
  const params = new URLSearchParams(searchParams);
  params.set(PLATFORM_PARAM, platformId);

  return `${pathname}?${params.toString()}`;
}
