import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl dark:shadow-primary/25",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-xl dark:shadow-destructive/25",
        outline:
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 dark:shadow-emerald-500/25",
        warning:
          "border-transparent bg-amber-500 text-white shadow-lg hover:bg-amber-600 dark:shadow-amber-500/25",
        info: "border-transparent bg-blue-500 text-white shadow-lg hover:bg-blue-600 dark:shadow-blue-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
