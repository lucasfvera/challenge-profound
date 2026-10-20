"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"

// The popover is the overlay the app reads a secondary piece of copy from —
// the metric's explanation, today. It opens on a click and on a tap, and —
// when the trigger asks for it — on a hover.
//
// The trigger is a control — it takes focus and it answers a click — so it
// carries the pointer, the affordance LUC-19 gave every clickable control.
// Its hover is the app's quiet hover: the surface shifts to `--muted` and the
// foreground comes forward. It draws no focus ring of its own: the app draws
// focus once, with the global `:focus-visible` rule in src/app/globals.css.
//
// The popup wears the app's overlay tokens: `--popover` with
// `--popover-foreground` on it, and the hairline `--border` around it. The
// shadcn CLI slides and zooms the popup in; the design system asks for
// restrained motion, so the popup fades.
//
// The trigger's `className` is narrowed to a string. Base UI accepts a
// function of the trigger's state there, and `cn` would drop a function
// without saying so.
function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root {...props} />
}

function PopoverTrigger({
  className,
  ...props
}: Omit<PopoverPrimitive.Trigger.Props, "className"> & {
  className?: string
}) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      className={cn(
        "cursor-pointer hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: Omit<PopoverPrimitive.Popup.Props, "className"> &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    className?: string
  }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "flex w-fit max-w-xs flex-col gap-1 rounded-md border border-border bg-popover px-3 py-2 text-sm leading-5 text-popover-foreground shadow-md data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

/**
 * The popover's name.
 *
 * It is what a screen reader reads when the popover opens, so the popover
 * is never an unnamed dialog. The card keeps it out of sight and lets the
 * explanation carry the reading.
 */
function PopoverTitle({
  className,
  ...props
}: Omit<PopoverPrimitive.Title.Props, "className"> & {
  className?: string
}) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

/**
 * The popover's body, and what a screen reader reads with it.
 *
 * The description is the element the popover points its `aria-describedby`
 * at, so the copy inside the popover is the copy that is announced.
 */
function PopoverDescription({
  className,
  ...props
}: Omit<PopoverPrimitive.Description.Props, "className"> & {
  className?: string
}) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
}
