/**
 * The Snapshot module: the app's only data source.
 *
 * Everything the app shows comes from `snapshot` — a fixed, fictional dataset.
 * There is no fetching layer and nothing is generated at runtime.
 */

export { snapshot } from "./fixture";
export type {
  Answer,
  Brand,
  BrandId,
  BrandKind,
  Citation,
  CitationId,
  Platform,
  PlatformId,
  Prompt,
  PromptCategory,
  PromptId,
  Snapshot,
  VisibilityPoint,
  VisibilitySeries,
} from "./types";
