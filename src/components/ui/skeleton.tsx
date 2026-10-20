import * as React from "react"
import { cn } from "cn"

// The skeleton is an inert placeholder: it has no hover, focus, or disabled
// state, because nothing about it is interactive. The pulse stops for readers
// who ask for reduced motion.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-muted motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
