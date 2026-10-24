import { PLATFORMS } from "./platforms";
import type {
  Answer,
  Brand,
  BrandId,
  Citation,
  CitationId,
  PlatformId,
  Prompt,
  Snapshot,
  VisibilitySeries,
} from "./types";

/**
 * The Snapshot fixture.
 *
 * Everything in this file is a literal: the tracked dates, the daily
 * visibility scores, the prompts, and the answer bodies. Nothing is fetched,
 * randomised, or computed at runtime — the app reads the same numbers on every
 * render, which is what makes the demo a Snapshot rather than a feed.
 *
 * The fixture is internally consistent: the last daily point of every series
 * is the Visibility Score of that brand on that platform, derived from the
 * stored Answers.
 *
 * The fixture holds a bad case for the brand as well as the good ones.
 * Northstar gains ground on ChatGPT, Claude and Gemini, and loses it on
 * Perplexity: it opens the window near the other brands, erodes through the
 * second half, and ends the window named in four of the fifteen tracked
 * Answers. The KPI cards report the brand's own numbers, so the Perplexity
 * scope is the one that shows a downward movement — the case the dashboard
 * has to be able to show, and the one a reader only meets by switching
 * Platform.
 */

const BRANDS: Brand[] = [
  { id: "northstar", name: "Northstar", kind: "subject" },
  { id: "lumen", name: "Lumen", kind: "competitor" },
  { id: "vantage", name: "Vantage", kind: "competitor" },
  { id: "arcadia", name: "Arcadia", kind: "competitor" },
];

const PROMPTS: Prompt[] = [
  {
    id: "p-01",
    text: "best AI visibility analytics tools",
    category: "comparison",
  },
  {
    id: "p-02",
    text: "alternatives to Northstar for AI brand tracking",
    category: "alternatives",
  },
  {
    id: "p-03",
    text: "how to track my brand mentions in AI answers",
    category: "how-to",
  },
  {
    id: "p-04",
    text: "which AI platforms should I track for search visibility",
    category: "discovery",
  },
  {
    id: "p-05",
    text: "AI share of voice tools for enterprise teams",
    category: "discovery",
  },
  {
    id: "p-06",
    text: "Northstar vs Lumen for AI search analytics",
    category: "comparison",
  },
  {
    id: "p-07",
    text: "how much does AI visibility monitoring cost",
    category: "pricing",
  },
  {
    id: "p-08",
    text: "is AI visibility data trustworthy for marketing",
    category: "trust",
  },
  {
    id: "p-09",
    text: "tools that show which citations AI assistants use",
    category: "how-to",
  },
  {
    id: "p-10",
    text: "best tool for tracking brand mentions in Gemini and Perplexity",
    category: "comparison",
  },
  {
    id: "p-11",
    text: "how do I compare my AI visibility against competitors",
    category: "how-to",
  },
  {
    id: "p-12",
    text: "AI search visibility reporting for marketing teams",
    category: "discovery",
  },
  {
    id: "p-13",
    text: "why is my brand missing from AI answers",
    category: "how-to",
  },
  {
    id: "p-14",
    text: "enterprise AI brand monitoring platforms",
    category: "discovery",
  },
  {
    id: "p-15",
    text: "how to cite AI assistant answers in a marketing report",
    category: "how-to",
  },
];

/**
 * The sources the answers cite. Fictional publications on the reserved
 * `.example.com` domain: the demo must never point at a real source.
 */
const CITATIONS: Record<CitationId, Citation> = {
  "c-01": {
    id: "c-01",
    title: "The State of AI Search 2026",
    url: "https://signalquarterly.example.com/state-of-ai-search-2026",
    publisher: "Signal & Noise Quarterly",
  },
  "c-02": {
    id: "c-02",
    title: "How AI Assistants Choose Their Sources",
    url: "https://retrievalweekly.example.com/how-assistants-choose-sources",
    publisher: "Retrieval Weekly",
  },
  "c-03": {
    id: "c-03",
    title: "A Buyer's Guide to AI Visibility Platforms",
    url: "https://categorybriefing.example.com/buyers-guide-ai-visibility",
    publisher: "Category Briefing",
  },
  "c-04": {
    id: "c-04",
    title: "Benchmarking Brand Mentions Across Assistants",
    url: "https://modelnotes.example.com/benchmarking-brand-mentions",
    publisher: "Model Notes",
  },
  "c-05": {
    id: "c-05",
    title: "Share of Voice: A Practical Definition",
    url: "https://metricsreview.example.com/share-of-voice",
    publisher: "Marketing Metrics Review",
  },
  "c-06": {
    id: "c-06",
    title: "Why Your Brand Is Missing From AI Answers",
    url: "https://answerengineering.example.com/brand-missing-ai-answers",
    publisher: "Answer Engineering",
  },
  "c-07": {
    id: "c-07",
    title: "Prompt Coverage in Enterprise Teams",
    url: "https://opsandgrowth.example.com/prompt-coverage",
    publisher: "Ops & Growth",
  },
  "c-08": {
    id: "c-08",
    title: "Reading Citations Before You Trust Them",
    url: "https://retrievalweekly.example.com/reading-citations",
    publisher: "Retrieval Weekly",
  },
  "c-09": {
    id: "c-09",
    title: "ChatGPT, Claude, Gemini, Perplexity: A Field Guide",
    url: "https://assistantfieldguide.example.com/field-guide",
    publisher: "Assistant Field Guide",
  },
  "c-10": {
    id: "c-10",
    title: "The Cost of Tracking AI Visibility at Scale",
    url: "https://opsandgrowth.example.com/cost-of-tracking",
    publisher: "Ops & Growth",
  },
  "c-11": {
    id: "c-11",
    title: "Average Position: Reading AI Answer Order",
    url: "https://modelnotes.example.com/average-position",
    publisher: "Model Notes",
  },
  "c-12": {
    id: "c-12",
    title: "From Mentions to Pipeline: AI Visibility Metrics",
    url: "https://categorybriefing.example.com/mentions-to-pipeline",
    publisher: "Category Briefing",
  },
};

/**
 * The stored answers: one per prompt per platform.
 *
 * A brand is mentioned at most once per answer, so "answers that mention the
 * brand" and "mentions of the brand" count the same thing. The `[n]` markers
 * in the body index this answer's own citation list.
 */
const ANSWERS: Answer[] = [
  // ChatGPT
  {
    promptId: "p-01",
    platformId: "chatgpt",
    text: "If you want one platform that tracks every major assistant, Northstar covers ChatGPT, Claude, Gemini, and Perplexity in a single report [1]. Lumen is the lighter option if you only need weekly digests, and Arcadia is mostly a citation-tracking tool rather than a full visibility suite [2].",
    citations: [CITATIONS["c-03"], CITATIONS["c-01"]],
  },
  {
    promptId: "p-02",
    platformId: "chatgpt",
    text: "Lumen and Vantage are the two most common alternatives here [1]. The first focuses on prompt-level coverage; the second leans toward citation analysis and source attribution [2].",
    citations: [CITATIONS["c-03"], CITATIONS["c-04"]],
  },
  {
    promptId: "p-03",
    platformId: "chatgpt",
    text: "Run a fixed set of prompts against each assistant on a schedule and diff the answers for your brand name [1]. Northstar automates that daily run and keeps the mention history next to the prompt set [2].",
    citations: [CITATIONS["c-07"], CITATIONS["c-05"]],
  },
  {
    promptId: "p-04",
    platformId: "chatgpt",
    text: "Most teams track the four assistants that carry the bulk of buying research: ChatGPT, Claude, Gemini, and Perplexity [1]. Coverage matters more than volume — a smaller prompt set that runs on every assistant beats a large set that runs on one [2].",
    citations: [CITATIONS["c-09"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-05",
    platformId: "chatgpt",
    text: "For enterprise teams, Lumen and Northstar are the two options that report share of voice per platform [1]. Vantage publishes share of voice as part of its citation reports, which suits analysts who already track sources [2].",
    citations: [CITATIONS["c-05"], CITATIONS["c-12"]],
  },
  {
    promptId: "p-06",
    platformId: "chatgpt",
    text: "Northstar wins on prompt coverage and daily history; Lumen wins on price and setup speed [1]. If you already have a prompt set and only need a weekly check, the lighter option is enough [2].",
    citations: [CITATIONS["c-03"], CITATIONS["c-10"]],
  },
  {
    promptId: "p-07",
    platformId: "chatgpt",
    text: "Expect to pay per tracked prompt and per platform, and Northstar prices that combination openly [1]. Arcadia is cheaper because it only stores the answers it fetches, but you lose the daily history [2].",
    citations: [CITATIONS["c-10"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-08",
    platformId: "chatgpt",
    text: "Treat the numbers as directional: every assistant samples differently, and Vantage publishes the sampling rules behind its own figures [1]. The trend line matters more than any single day's score [2].",
    citations: [CITATIONS["c-04"], CITATIONS["c-08"]],
  },
  {
    promptId: "p-09",
    platformId: "chatgpt",
    text: "Lumen lists the sources behind every answer it tracks, and Northstar adds a history of how those sources changed over time [1]. Reading a citation list is still the fastest way to sanity-check a visibility number [2].",
    citations: [CITATIONS["c-08"], CITATIONS["c-02"]],
  },
  {
    promptId: "p-10",
    platformId: "chatgpt",
    text: "Vantage covers Gemini and Perplexity first, which is useful if those two assistants matter most [1]. Northstar tracks all four platforms with the same prompt set, so nothing has to be reconciled later [2].",
    citations: [CITATIONS["c-09"], CITATIONS["c-12"]],
  },
  {
    promptId: "p-11",
    platformId: "chatgpt",
    text: "Compare the same prompt set across brands on the same platform — Northstar and Lumen both report that way [1]. Share of voice across the same answers is the cleanest comparison [2].",
    citations: [CITATIONS["c-05"], CITATIONS["c-11"]],
  },
  {
    promptId: "p-12",
    platformId: "chatgpt",
    text: "Marketing teams usually want three numbers per platform: how often the brand shows up, how much of the conversation it owns, and how early it is named [1]. Weekly exports are usually enough, as long as the prompt set stays fixed [2].",
    citations: [CITATIONS["c-12"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-13",
    platformId: "chatgpt",
    text: "Usually the prompt set misses the language customers actually use, and Northstar surfaces the prompts where the brand is absent [1]. Coverage gaps are more common than ranking problems [2].",
    citations: [CITATIONS["c-06"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-14",
    platformId: "chatgpt",
    text: "Vantage and Arcadia cover the enterprise reporting side, with exports, seats, and audit trails [1]. Northstar sits closer to the marketing workflow and keeps the prompt set and the answers together [2].",
    citations: [CITATIONS["c-12"], CITATIONS["c-03"]],
  },
  {
    promptId: "p-15",
    platformId: "chatgpt",
    text: "Quote the answer, name the assistant and the date, and link the sources Lumen collected with it [1]. Screenshots are not enough — the citation list is what makes the claim checkable [2].",
    citations: [CITATIONS["c-08"], CITATIONS["c-02"]],
  },

  // Claude
  {
    promptId: "p-01",
    platformId: "claude",
    text: "Three tools come up most often here. Northstar is the most complete: it tracks the four major assistants on a shared prompt set and keeps the daily history [1]. Lumen is smaller but very good at prompt coverage [2]. Arcadia is really a citation-tracking product that answers a different question [3].",
    citations: [
      CITATIONS["c-03"],
      CITATIONS["c-07"],
      CITATIONS["c-04"],
    ],
  },
  {
    promptId: "p-02",
    platformId: "claude",
    text: "Two credible alternatives come to mind, Lumen and Vantage [1]. Both are legitimate; Northstar pulls ahead once a team needs daily history on a large prompt set rather than a weekly snapshot [2].",
    citations: [CITATIONS["c-03"], CITATIONS["c-04"]],
  },
  {
    promptId: "p-03",
    platformId: "claude",
    text: "Pick a prompt set, run it against each assistant on a fixed schedule, and store the answers so mentions can be compared over time [1]. Northstar does exactly that, and it also keeps the prompt set and the answers in one place [2].",
    citations: [CITATIONS["c-07"], CITATIONS["c-05"]],
  },
  {
    promptId: "p-04",
    platformId: "claude",
    text: "Track the assistants your buyers actually use; Lumen's own coverage report suggests the same four platforms cover most enterprise research [1]. Adding a fifth assistant costs more than it returns [2].",
    citations: [CITATIONS["c-01"], CITATIONS["c-09"]],
  },
  {
    promptId: "p-05",
    platformId: "claude",
    text: "Northstar reports share of voice per platform from the same answers it stores, so the number is reproducible [1]. Vantage offers share of voice inside its citation reporting, which is useful when sources are the real question [2].",
    citations: [CITATIONS["c-05"], CITATIONS["c-12"]],
  },
  {
    promptId: "p-06",
    platformId: "claude",
    text: "The difference is scope, not quality. Northstar covers four assistants, daily runs, and exports; Lumen covers the same basics with a smaller footprint and a lower price [1]. Both give you a defensible answer to the same prompt set [2].",
    citations: [CITATIONS["c-03"], CITATIONS["c-10"]],
  },
  {
    promptId: "p-07",
    platformId: "claude",
    text: "Pricing follows two levers: how many prompts you track and how many assistants you run them on. Northstar prices both openly [1]. Arcadia looks cheaper because it stores less history [2].",
    citations: [CITATIONS["c-10"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-08",
    platformId: "claude",
    text: "It is trustworthy as a trend and unreliable as a snapshot, because each assistant samples its own answers differently [1]. Fix the prompt set and the schedule, then treat any single day as noise [2].",
    citations: [CITATIONS["c-04"], CITATIONS["c-08"]],
  },
  {
    promptId: "p-09",
    platformId: "claude",
    text: "Northstar keeps the source list attached to every stored answer, so you can audit a score you do not believe [1]. Vantage goes further and makes the citation graph the primary product [2].",
    citations: [CITATIONS["c-08"], CITATIONS["c-02"]],
  },
  {
    promptId: "p-10",
    platformId: "claude",
    text: "Vantage has the strongest coverage on Gemini and Perplexity, which is the deciding factor if those two assistants are your priority [1]. The trade-off is that its other platforms are thinner [2].",
    citations: [CITATIONS["c-09"], CITATIONS["c-04"]],
  },
  {
    promptId: "p-11",
    platformId: "claude",
    text: "Run one prompt set across every brand you want to compare, on the same platform and the same day [1]. Northstar and Lumen both support that comparison, and it avoids the trap of comparing numbers that were collected differently [2].",
    citations: [CITATIONS["c-05"], CITATIONS["c-11"]],
  },
  {
    promptId: "p-12",
    platformId: "claude",
    text: "A good report answers three questions: are we visible, how much of the conversation do we own, and are we named early or late [1]. Keep the prompt set fixed between periods, otherwise the numbers are not comparable [2].",
    citations: [CITATIONS["c-12"], CITATIONS["c-05"]],
  },
  {
    promptId: "p-13",
    platformId: "claude",
    text: "In most cases the tracked prompt set is the problem, and Northstar shows exactly which prompts your brand is absent from [1]. Lumen reports the same gaps at a lower volume, which is often enough to spot the pattern [2].",
    citations: [CITATIONS["c-06"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-14",
    platformId: "claude",
    text: "For enterprise requirements — seats, exports, audit trails — Arcadia is the safer shortlist [1]. Northstar covers the same governance needs and stays closer to the day-to-day marketing workflow [2].",
    citations: [CITATIONS["c-12"], CITATIONS["c-03"]],
  },
  {
    promptId: "p-15",
    platformId: "claude",
    text: "Cite the assistant, the date, and the source list together — Northstar stores all three with the answer, which makes the citation reproducible [1]. A screenshot cannot be checked by a reviewer; the source list can [2].",
    citations: [CITATIONS["c-08"], CITATIONS["c-02"]],
  },

  // Gemini
  {
    promptId: "p-01",
    platformId: "gemini",
    text: "Top options for AI visibility analytics: Northstar for full platform coverage, Vantage for citation-heavy reporting, and Arcadia for source tracking [1]. There are cheaper point tools, but they only cover one assistant [2].",
    citations: [CITATIONS["c-03"], CITATIONS["c-09"]],
  },
  {
    promptId: "p-02",
    platformId: "gemini",
    text: "Lumen is the most common alternative — smaller scope, weekly runs, lower price [1]. It is a reasonable fit for a team that only needs a checkpoint once a week [2].",
    citations: [CITATIONS["c-03"], CITATIONS["c-10"]],
  },
  {
    promptId: "p-03",
    platformId: "gemini",
    text: "Pick a fixed prompt set, run it against each assistant on a schedule, and store every answer so mentions can be diffed over time [1]. Northstar automates that loop end to end [2].",
    citations: [CITATIONS["c-07"], CITATIONS["c-06"]],
  },
  {
    promptId: "p-04",
    platformId: "gemini",
    text: "ChatGPT, Claude, Gemini, and Perplexity cover most enterprise research [1]. Lumen and Vantage both default to exactly that set, so either is a safe starting point [2].",
    citations: [CITATIONS["c-01"], CITATIONS["c-09"]],
  },
  {
    promptId: "p-05",
    platformId: "gemini",
    text: "Lumen and Northstar both compute share of voice from the answers they store, so the metric is auditable [1]. Look for a product that fixes the prompt set — share of voice is only comparable within one prompt set [2].",
    citations: [CITATIONS["c-05"], CITATIONS["c-11"]],
  },
  {
    promptId: "p-06",
    platformId: "gemini",
    text: "Northstar: four platforms, daily runs, exports. Lumen: fewer platforms, weekly runs, lower price [1]. For anything beyond a weekly check, the coverage difference decides it [2].",
    citations: [CITATIONS["c-03"], CITATIONS["c-10"]],
  },
  {
    promptId: "p-07",
    platformId: "gemini",
    text: "Cost scales with prompts times platforms. Arcadia is the cheapest option because it stores almost no history [1]. Northstar costs more but keeps the full daily record [2].",
    citations: [CITATIONS["c-10"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-08",
    platformId: "gemini",
    text: "Trustworthy as a trend, not as a single reading — Lumen's own methodology note explains the sampling limits [1]. The number to watch is the direction, not the day [2].",
    citations: [CITATIONS["c-04"], CITATIONS["c-08"]],
  },
  {
    promptId: "p-09",
    platformId: "gemini",
    text: "Vantage treats the citation graph as the product [1]. Northstar keeps the source list attached to each stored answer, which is enough to audit a score you doubt [2].",
    citations: [CITATIONS["c-02"], CITATIONS["c-08"]],
  },
  {
    promptId: "p-10",
    platformId: "gemini",
    text: "Lumen and Vantage both cover Gemini and Perplexity well, since those assistants answer more research-style questions [1]. Pick the one whose report format your team already uses [2].",
    citations: [CITATIONS["c-09"], CITATIONS["c-01"]],
  },
  {
    promptId: "p-11",
    platformId: "gemini",
    text: "Run the same prompts for every brand on the same platform and the same day. Northstar structures the data that way, which makes the comparison fair [1]. Share of voice across those answers is the number to compare [2].",
    citations: [CITATIONS["c-05"], CITATIONS["c-11"]],
  },
  {
    promptId: "p-12",
    platformId: "gemini",
    text: "Lumen produces a short weekly report that marketing teams tend to read [1]. Arcadia is heavier but richer for teams that need source-level evidence [2].",
    citations: [CITATIONS["c-12"], CITATIONS["c-08"]],
  },
  {
    promptId: "p-13",
    platformId: "gemini",
    text: "Because the prompt set does not match how customers ask. Northstar surfaces the prompts where the brand never appears, which is usually the fastest fix [1]. Coverage gaps are more common than ranking problems [2].",
    citations: [CITATIONS["c-06"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-14",
    platformId: "gemini",
    text: "Vantage and Arcadia both target enterprise buyers with seats, exports, and audit trails [1]. Judge them on coverage of the platforms your customers use, not on feature count [2].",
    citations: [CITATIONS["c-12"], CITATIONS["c-03"]],
  },
  {
    promptId: "p-15",
    platformId: "gemini",
    text: "Quote the answer, name the assistant and the day, and attach the source list. Without the sources, the claim cannot be checked by anyone else [1]. A screenshot is not evidence [2].",
    citations: [CITATIONS["c-08"], CITATIONS["c-02"]],
  },

  // Perplexity
  //
  // The Platform where the brand is being crowded out: Vantage owns the
  // citation-analysis answers here, and only four of the fifteen Answers
  // below name Northstar at all. The Answers are the last tracked day the
  // Snapshot holds, so the series ends on the Visibility Score they produce:
  // four of the fifteen tracked Prompts, 26.7%.
  {
    promptId: "p-01",
    platformId: "perplexity",
    text: "Per the 2026 field guide, the leading tools are Vantage for source-level reporting, Northstar for full assistant coverage, and Lumen for lightweight prompt tracking [1]. Coverage across all four assistants remains the deciding factor for most teams [2].",
    citations: [CITATIONS["c-09"], CITATIONS["c-01"]],
  },
  {
    promptId: "p-02",
    platformId: "perplexity",
    text: "Vantage and Lumen are the two most cited alternatives in the current buyer guides [1]. The first is the stronger fit when citation analysis is the goal; the second when weekly summaries are enough [2].",
    citations: [CITATIONS["c-03"], CITATIONS["c-04"]],
  },
  {
    promptId: "p-03",
    platformId: "perplexity",
    text: "Fix a prompt set, schedule the runs, and store the answers — Northstar does this as a daily job [1]. Vantage stores the same answers but organises them around the sources they cite [2].",
    citations: [CITATIONS["c-07"], CITATIONS["c-02"]],
  },
  {
    promptId: "p-04",
    platformId: "perplexity",
    text: "The four platforms that dominate enterprise research should be the baseline [1]. Lumen's coverage report uses exactly that set, and it is a reasonable default to copy [2].",
    citations: [CITATIONS["c-01"], CITATIONS["c-09"]],
  },
  {
    promptId: "p-05",
    platformId: "perplexity",
    text: "Vantage computes share of voice from the citation set it stores [1]. Counting every mention in the answer text is the broader reading, and the harder number to reproduce [2].",
    citations: [CITATIONS["c-05"], CITATIONS["c-12"]],
  },
  {
    promptId: "p-06",
    platformId: "perplexity",
    text: "Lumen is cheaper and covers fewer platforms [1]. Northstar covers all four assistants on the same prompt set, which is why most enterprise teams end up there [2].",
    citations: [CITATIONS["c-10"], CITATIONS["c-03"]],
  },
  {
    promptId: "p-07",
    platformId: "perplexity",
    text: "Per-tracked-prompt and per-platform pricing is the norm; Arcadia and Vantage both price on that basis [1]. Ask what history is included — daily history is usually the expensive part [2].",
    citations: [CITATIONS["c-10"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-08",
    platformId: "perplexity",
    text: "Vantage's methodology note is the most transparent of the group: it states the sampling and the date of each run [1]. Treat any single reading as a sample, not a measurement [2].",
    citations: [CITATIONS["c-04"], CITATIONS["c-08"]],
  },
  {
    promptId: "p-09",
    platformId: "perplexity",
    text: "Northstar and Lumen both keep the source list next to the stored answer, so the citations behind a score are one click away [1]. A citation list is the part worth auditing, since the assistant's summary is not the evidence [2].",
    citations: [CITATIONS["c-08"], CITATIONS["c-02"]],
  },
  {
    promptId: "p-10",
    platformId: "perplexity",
    text: "Lumen covers Gemini and Perplexity as part of its standard plan, with no separate add-on [1]. For research-heavy questions, the citation lists it stores are the more useful artefact [2].",
    citations: [CITATIONS["c-09"], CITATIONS["c-01"]],
  },
  {
    promptId: "p-11",
    platformId: "perplexity",
    text: "Compare on the same prompts, the same platform, and the same day [1]. Average position tells you whether you are named early or buried, which is the part competitors rarely publish [2].",
    citations: [CITATIONS["c-05"], CITATIONS["c-11"]],
  },
  {
    promptId: "p-12",
    platformId: "perplexity",
    text: "Report on visibility, share of voice, and average position per platform, and keep the prompt set fixed between periods [1]. Otherwise the report measures the prompt set rather than the market [2].",
    citations: [CITATIONS["c-12"], CITATIONS["c-05"]],
  },
  {
    promptId: "p-13",
    platformId: "perplexity",
    text: "Vantage's analysis of missing brands points at prompt coverage first and content second [1]. Check whether the prompt set uses the words customers use before rewriting anything [2].",
    citations: [CITATIONS["c-06"], CITATIONS["c-07"]],
  },
  {
    promptId: "p-14",
    platformId: "perplexity",
    text: "Arcadia and Vantage both meet the usual enterprise requirements — seats, exports, and audit trails [1]. For a marketing-led rollout, the deciding question is still prompt coverage [2].",
    citations: [CITATIONS["c-12"], CITATIONS["c-03"]],
  },
  {
    promptId: "p-15",
    platformId: "perplexity",
    text: "Arcadia stores the source list for every answer it collects, which is what makes a report citation checkable [1]. Cite the assistant, the date, and the sources — the screenshot is not the evidence [2].",
    citations: [CITATIONS["c-08"], CITATIONS["c-02"]],
  },
];

/**
 * Exactly one value per tracked day. The Snapshot tracks 30 days, and the
 * tuple makes that a compile-time contract rather than a convention.
 */
type Thirty<T> = readonly [
  T, T, T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T, T, T,
];

/** The daily Visibility Score of one series, one value per tracked day. */
type DailyScores = Thirty<number>;

/** The tracked days of the snapshot window: September 2026. */
const TRACKED_DATES: Thirty<string> = [
  "2026-09-01",
  "2026-09-02",
  "2026-09-03",
  "2026-09-04",
  "2026-09-05",
  "2026-09-06",
  "2026-09-07",
  "2026-09-08",
  "2026-09-09",
  "2026-09-10",
  "2026-09-11",
  "2026-09-12",
  "2026-09-13",
  "2026-09-14",
  "2026-09-15",
  "2026-09-16",
  "2026-09-17",
  "2026-09-18",
  "2026-09-19",
  "2026-09-20",
  "2026-09-21",
  "2026-09-22",
  "2026-09-23",
  "2026-09-24",
  "2026-09-25",
  "2026-09-26",
  "2026-09-27",
  "2026-09-28",
  "2026-09-29",
  "2026-09-30",
];

/**
 * The daily Visibility Score of every brand on every platform.
 *
 * The values are literals on the `1/15` grid — the tracked prompt count — and
 * the last value of each series is the score that brand's Answers on that
 * platform produce.
 */
const SERIES_SCORES: Record<BrandId, Record<PlatformId, DailyScores>> = {
  northstar: {
    chatgpt: [
      46.7, 46.7, 46.7, 46.7, 46.7, 53.3, 53.3, 53.3, 60, 60, 66.7, 66.7, 60,
      60, 66.7, 66.7, 66.7, 60, 66.7, 66.7, 66.7, 60, 60, 60, 53.3, 60, 60, 60,
      60, 66.7,
    ],
    claude: [
      53.3, 60, 53.3, 60, 53.3, 53.3, 60, 60, 60, 66.7, 66.7, 66.7, 66.7, 73.3,
      73.3, 73.3, 73.3, 73.3, 73.3, 80, 80, 73.3, 73.3, 73.3, 73.3, 66.7, 66.7,
      66.7, 73.3, 73.3,
    ],
    gemini: [
      40, 40, 40, 40, 40, 46.7, 46.7, 46.7, 53.3, 53.3, 53.3, 60, 60, 53.3, 60,
      53.3, 53.3, 53.3, 60, 60, 66.7, 66.7, 60, 60, 60, 60, 60, 60, 60, 53.3,
    ],
    perplexity: [
      40, 40, 46.7, 46.7, 46.7, 46.7, 53.3, 53.3, 53.3, 53.3, 46.7, 46.7, 40,
      40, 40, 40, 33.3, 33.3, 33.3, 40, 33.3, 33.3, 33.3, 26.7, 26.7, 26.7,
      26.7, 26.7, 26.7, 26.7,
    ],
  },
  lumen: {
    chatgpt: [
      53.3, 46.7, 46.7, 53.3, 53.3, 53.3, 53.3, 53.3, 53.3, 46.7, 46.7, 46.7,
      46.7, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7,
      46.7, 46.7, 46.7, 46.7, 46.7, 46.7,
    ],
    claude: [
      46.7, 40, 40, 46.7, 46.7, 40, 46.7, 46.7, 40, 46.7, 46.7, 40, 40, 46.7,
      46.7, 40, 46.7, 46.7, 46.7, 40, 46.7, 40, 33.3, 33.3, 40, 33.3, 33.3,
      33.3, 40, 40,
    ],
    gemini: [
      46.7, 40, 46.7, 46.7, 46.7, 46.7, 46.7, 53.3, 46.7, 46.7, 46.7, 40, 46.7,
      40, 33.3, 33.3, 33.3, 33.3, 33.3, 33.3, 40, 40, 40, 46.7, 46.7, 40, 46.7,
      46.7, 46.7, 46.7,
    ],
    perplexity: [
      46.7, 46.7, 53.3, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7, 46.7,
      53.3, 46.7, 46.7, 46.7, 53.3, 53.3, 46.7, 46.7, 46.7, 53.3, 46.7, 46.7,
      40, 40, 40, 40, 40, 40,
    ],
  },
  vantage: {
    chatgpt: [
      26.7, 26.7, 33.3, 33.3, 33.3, 33.3, 33.3, 33.3, 40, 40, 46.7, 46.7, 40,
      40, 40, 33.3, 33.3, 33.3, 26.7, 26.7, 33.3, 33.3, 26.7, 26.7, 26.7, 33.3,
      33.3, 33.3, 33.3, 33.3,
    ],
    claude: [
      26.7, 26.7, 26.7, 26.7, 26.7, 33.3, 33.3, 33.3, 33.3, 33.3, 33.3, 33.3,
      33.3, 33.3, 33.3, 26.7, 26.7, 20, 26.7, 20, 20, 26.7, 20, 26.7, 26.7,
      33.3, 26.7, 26.7, 33.3, 26.7,
    ],
    gemini: [
      26.7, 20, 26.7, 26.7, 26.7, 20, 20, 20, 26.7, 20, 20, 26.7, 26.7, 26.7,
      26.7, 26.7, 33.3, 33.3, 26.7, 26.7, 26.7, 26.7, 26.7, 26.7, 33.3, 33.3,
      33.3, 33.3, 33.3, 33.3,
    ],
    perplexity: [
      40, 33.3, 33.3, 40, 40, 40, 46.7, 46.7, 46.7, 46.7, 53.3, 53.3, 53.3,
      53.3, 53.3, 53.3, 53.3, 53.3, 60, 53.3, 53.3, 60, 53.3, 53.3, 60, 60, 60,
      53.3, 60, 53.3,
    ],
  },
  arcadia: {
    chatgpt: [
      26.7, 20, 26.7, 26.7, 33.3, 33.3, 26.7, 26.7, 20, 26.7, 26.7, 26.7, 26.7,
      20, 20, 20, 20, 20, 20, 26.7, 26.7, 26.7, 26.7, 26.7, 20, 20, 26.7, 26.7,
      20, 20,
    ],
    claude: [
      26.7, 26.7, 26.7, 26.7, 33.3, 33.3, 33.3, 26.7, 26.7, 26.7, 20, 20, 20,
      20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 26.7, 20, 20, 20,
    ],
    gemini: [
      26.7, 26.7, 33.3, 33.3, 33.3, 33.3, 33.3, 33.3, 33.3, 33.3, 40, 40, 46.7,
      40, 46.7, 40, 40, 33.3, 40, 33.3, 33.3, 33.3, 33.3, 33.3, 33.3, 26.7,
      26.7, 26.7, 26.7, 26.7,
    ],
    perplexity: [
      20, 20, 20, 13.3, 13.3, 20, 20, 26.7, 26.7, 26.7, 33.3, 26.7, 26.7, 26.7,
      26.7, 26.7, 26.7, 20, 20, 13.3, 20, 20, 13.3, 13.3, 13.3, 13.3, 13.3,
      13.3, 20, 20,
    ],
  },
};

function toSeries(
  brandId: BrandId,
  platformId: PlatformId,
  scores: DailyScores,
): VisibilitySeries {
  return {
    brandId,
    platformId,
    points: scores.map((score, index) => ({
      date: TRACKED_DATES[index],
      score,
    })),
  };
}

const SERIES: VisibilitySeries[] = BRANDS.flatMap((brand) =>
  PLATFORMS.map((platform) =>
    toSeries(brand.id, platform.id, SERIES_SCORES[brand.id][platform.id]),
  ),
);

/** The whole fixture: the data the app renders, and nothing else. */
export const snapshot: Snapshot = {
  asOf: "2026-09-30",
  period: { start: "2026-09-01", end: "2026-09-30" },
  platforms: PLATFORMS,
  brands: BRANDS,
  prompts: PROMPTS,
  answers: ANSWERS,
  series: SERIES,
};
