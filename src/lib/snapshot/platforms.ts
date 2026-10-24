import type { Platform, PlatformId } from "./types";

/**
 * The Platforms the Snapshot tracks.
 *
 * They live in their own module because two very different consumers need
 * them: the fixture, which holds them as the Snapshot's data, and the
 * client boundary — the platform scope control and the URL contract — which
 * must not pull the whole fixture into the browser to learn that there are
 * four assistants.
 *
 * This module is therefore imported directly, not through the Snapshot's
 * barrel: the barrel carries the fixture, and the browser has no use for it.
 *
 * The record is the source and the list is derived from it, so the two
 * never drift and a Platform id always resolves to a Platform.
 */
const PLATFORM_BY_ID = {
  chatgpt: { id: "chatgpt", name: "ChatGPT" },
  claude: { id: "claude", name: "Claude" },
  gemini: { id: "gemini", name: "Gemini" },
  perplexity: { id: "perplexity", name: "Perplexity" },
} satisfies Record<PlatformId, Platform>;

/** The tracked Platforms, in the order the Snapshot lists them. */
export const PLATFORMS: Platform[] = Object.values(PLATFORM_BY_ID);

/** The tracked Platform a Platform id stands for. */
export function platformById(platformId: PlatformId): Platform {
  return PLATFORM_BY_ID[platformId];
}
