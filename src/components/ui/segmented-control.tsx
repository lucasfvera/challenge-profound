"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { cn } from "cn"

// The segmented control is a quiet track with one selected segment. It
// draws no focus indicator of its own — the app draws focus once, with the
// global `:focus-visible` rule in src/app/globals.css — and it never
// reaches for the brand accent: the selected segment is the document's
// selected chrome, the quiet surface with the foreground text, and the
// hairline border is the track's.
//
// The control holds no domain state. Which segment is selected belongs to
// the caller: the group takes the pressed values through `value` and reports
// them through `onValueChange`, the way Base UI's toggle group models them.
function SegmentedControl({
  className,
  ...props
}: Omit<ToggleGroupPrimitive.Props<string>, "className" | "multiple"> & {
  className?: string
}) {
  return (
    <ToggleGroupPrimitive
      data-slot="segmented-control"
      className={cn(
        "inline-flex items-center rounded-md border border-border p-0.5",
        className
      )}
      {...props}
      multiple={false}
    />
  )
}

// A segment carries the value that identifies it inside the group: the
// group owns the pressed state, so the item's own `pressed` props are left
// out rather than advertised and ignored.
function SegmentedControlItem({
  className,
  ...props
}: Omit<
  TogglePrimitive.Props<string>,
  "className" | "value" | "pressed" | "defaultPressed" | "onPressedChange"
> & {
  className?: string
  value: string
}) {
  return (
    <TogglePrimitive
      data-slot="segmented-control-item"
      className={cn(
        "inline-flex h-7 items-center justify-center px-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors first:rounded-l-sm last:rounded-r-sm hover:not-aria-pressed:bg-muted hover:not-aria-pressed:text-foreground aria-pressed:bg-secondary aria-pressed:text-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem }
