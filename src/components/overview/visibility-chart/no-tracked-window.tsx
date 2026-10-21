/**
 * The chart's empty state: a Platform the Snapshot does not track a window
 * for.
 *
 * A metric the Snapshot cannot answer renders as an em dash — the design
 * system's rule — and says so to a screen reader.
 */
export function NoTrackedWindow() {
  return (
    <p className="text-xs leading-4 text-muted-foreground">
      <span aria-hidden="true">—</span>
      <span className="sr-only">This Platform has no tracked window.</span>
    </p>
  );
}
