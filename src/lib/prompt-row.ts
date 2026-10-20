import { platformScopeHref } from "@/lib/platform-scope";
import type { PlatformId, PromptId } from "@/lib/snapshot";

/**
 * The prompt row's contract: where a row goes, and how a row is activated.
 *
 * A row of the prompt table is a link into the detail route, so it carries
 * the Platform the table is scoped to: the route reads that Platform from the
 * URL and answers with the Answer it gave. The row is activated by the
 * keyboard as well as by the mouse, and the keys it answers to are fixed
 * here, so the surface and the acceptance criteria cannot drift apart.
 *
 * This module holds no data and reads none: it is the row's rules, and it
 * stays light enough for the client boundary to import.
 */

/**
 * The URL the detail route answers on for a Prompt, scoped to a Platform.
 *
 * The route reads the Platform from the `platform` search param, so the
 * drill-down carries the scope the table was showing. Without it the route
 * would fall back to the default Platform, and the reader would land on a
 * different Answer than the one they drilled into.
 *
 * The scope itself is written by the scope contract, so a URL that carries a
 * Platform is built in one place.
 */
export function promptDetailHref(
  promptId: PromptId,
  platformId: PlatformId,
): string {
  return platformScopeHref(
    `/prompts/${promptId}`,
    new URLSearchParams(),
    platformId,
  );
}

/**
 * The facts of a key press a prompt row has to answer to.
 */
export interface RowActivation {
  /** The key the browser reported. */
  key: string;
  /** Whether the press repeats, because the key is held down. */
  repeat: boolean;
  /** Whether the press carried a modifier key. */
  modified: boolean;
}

/**
 * Whether a key press activates a prompt row.
 *
 * Enter and Space both activate the row, and the surface activates it for
 * both: the behaviour is the same whichever key the reader presses. The
 * browser's own Enter activation is prevented, so the row is not activated
 * twice.
 *
 * A press that repeats is the key held down, and the row would be activated
 * again and again, leaving the history full of the same URL. A press with a
 * modifier belongs to the browser: a modified activation opens a new tab,
 * and the app must not take it over.
 */
export function isRowActivation(press: RowActivation): boolean {
  if (press.repeat) return false;
  if (press.modified) return false;

  return press.key === "Enter" || press.key === " ";
}
