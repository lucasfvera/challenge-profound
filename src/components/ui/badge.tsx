import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// The shadcn CLI writes a focus indicator of its own; the app draws focus
// once, with the global `:focus-visible` rule in src/app/globals.css. The
// `aria-invalid` mark below is the invalid state, not a focus state.
//
// The badge is a `<span>` by default, so it is not interactive and carries no
// hover. The hover utilities are scoped to the link rendering (`[a]:`), which
// is the interactive form of a badge.
//
// The secondary variant mixes the fill with 5% of the foreground on hover:
// no token is lighter than `--secondary`, and dimming the fill (`/80`) reads
// as a press instead of a hover.
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary-hover",
        destructive:
          "bg-destructive/10 text-destructive [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-foreground",
        ghost: "[a]:hover:bg-muted [a]:hover:text-foreground",
        link: "text-primary underline-offset-4 [a]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
