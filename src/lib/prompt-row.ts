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
export interface RowPress {
  /** The key the browser reported. */
  key: string;
  /** Whether the press repeats, because the key is held down. */
  repeat: boolean;
  /** Whether the press carried a modifier key. */
  modified: boolean;
}

/**
 * What a key press does to a prompt row.
 *
 * `activate` opens the row. `suppress` is a press the row has to keep the
 * browser's default off for — a held key, which must not open the row again
 * and must not scroll the page — without opening the row itself. `ignore` is
 * a press that belongs to the browser.
 */
export type RowActivation = "activate" | "suppress" | "ignore";

/**
 * What a key press does to a prompt row.
 *
 * Enter and Space both activate the row, and the surface activates it for
 * both: the behaviour is the same whichever key the reader presses. The
 * browser's own Enter activation is prevented, so the row is not opened
 * twice.
 *
 * A press that repeats is the key held down. The row must not open again,
 * and the browser's default must not fire either — a held Space would
 * scroll the page, and a held Enter would fill the history with the same
 * URL.
 *
 * A press with a modifier belongs to the browser, and the app leaves it
 * alone.
 */
export function rowActivation(press: RowPress): RowActivation {
  if (press.repeat) return "suppress";
  if (press.modified) return "ignore";

  if (press.key === "Enter" || press.key === " ") return "activate";

  return "ignore";
}
