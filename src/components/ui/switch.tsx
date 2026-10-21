"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

// A switch is an on-or-off control, so it carries its state the way a switch
// does — `role="switch"` and `aria-checked` — rather than the `aria-pressed`
// a toggle button wears. The state is the control's whole meaning, and the
// native role says so without a word of explanation.
//
// The track is a quiet surface: `--muted` while the switch is off, and the
// selected chrome, `--secondary`, while it is on. The accent is not used: the
// brand colour is the brand's data, and a control must not wear it. The thumb
// is the foreground while the switch is on, so the state reads as a change in
// the control itself and not only in the track behind it.
//
// The switch draws no focus indicator of its own — the app draws focus once,
// with the global `:focus-visible` rule in src/app/globals.css — and it
// carries the pointer, because it is the affordance that says it answers a
// click.
//
// The root is not a native control, so it is disabled with `aria-disabled`,
// and the disabled state is expressed that way — the rule the design system
// sets for anything that is not an input.
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted p-0.5 transition-colors data-checked:bg-secondary aria-disabled:pointer-events-none aria-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

// The thumb: the part that sits at one end of the track or the other, so the
// state is visible without colour.
function SwitchThumb({ className, ...props }: SwitchPrimitive.Thumb.Props) {
  return (
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(
        "pointer-events-none block size-4 rounded-full bg-muted-foreground transition-transform transition-colors data-checked:translate-x-4 data-checked:bg-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Switch, SwitchThumb };
