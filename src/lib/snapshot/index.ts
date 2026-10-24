/**
 * The Snapshot module: the app's only data source, and the pure derivations
 * on top of it.
 *
 * Everything the app shows comes from `snapshot` — a fixed, fictional dataset.
 * There is no fetching layer and nothing is generated at runtime.
 */

export { snapshot } from "./fixture";
export type {
  AnswerSegment,
  CitationSegment,
  MentionSegment,
  TextSegment,
} from "./segment";
export { segmentAnswer } from "./segment";
export type {
  BrandMetrics,
  ChartData,
  ChartRow,
  PlatformMetrics,
  SubjectMetrics,
  SubjectPlatformMetrics,
} from "./derive";
export {
  averagePosition,
  averageVisibilityScore,
  chartData,
  firstMentionPosition,
  platformMetrics,
  platformSeries,
  seriesPoints,
  shareOfVoice,
  shareOfVoiceTrend,
  subjectBrand,
  subjectMetrics,
  subjectPlatformMetrics,
  visibilityScore,
  visibilityTrend,
} from "./derive";
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
