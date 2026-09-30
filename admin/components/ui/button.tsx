import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-sm",
        outline:
          "border border-input/90 bg-background text-foreground shadow-2xs hover:bg-muted/60 hover:border-input active:bg-muted/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
        ghost:
          "hover:bg-muted/70 hover:text-foreground active:bg-muted",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 active:bg-destructive",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto active:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2 gap-2 text-sm",
        sm: "h-8 px-3 py-1.5 gap-1.5 text-xs [&_svg]:size-3.5",
        lg: "h-11 px-6 py-2.5 gap-2.5 text-base [&_svg]:size-5",
        xs: "h-7 px-2.5 gap-1 text-xs [&_svg]:size-3",
        icon: "size-10 gap-0 p-0 [&_svg]:size-4",
        "icon-sm": "size-8 gap-0 p-0 [&_svg]:size-3.5",
        "icon-xs": "size-6 gap-0 p-0 [&_svg]:size-3",
        "icon-lg": "size-11 gap-0 p-0 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  nativeButton,
  children,
  ...props
}: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>
    return React.cloneElement(child, {
      className: cn(buttonVariants({ variant, size, className }), child.props.className),
    })
  }

  // When a custom render element (like <Link> or <a>) is used without explicitly
  // providing nativeButton, default nativeButton to false so Base UI avoids console warnings.
  const resolvedNativeButton =
    nativeButton !== undefined
      ? nativeButton
      : props.render
        ? false
        : undefined

  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={resolvedNativeButton}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
