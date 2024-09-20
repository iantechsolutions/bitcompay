import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md shadow:none font-medium text-sm transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary shadow:none text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive shadow:none text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border shadow:none border-input text-[#3E3E3E] rounded-full bg-background shadow-sm hover:bg-accent hover:accent-current",
        form: "border-0 shadow:none border-b text-[#3E3E3E] bg-background rounded-none hover:bg-accent hover:accent-current",
        secondary:
          "bg-secondary shadow:none text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "shadow:none hover:bg-accent hover:text-accent-foreground",
        link: "shadow:none text-primary underline-offset-4 hover:underline",
        bitcompay:
          "h-7 bg-[#DEF5DD] hover:bg-[#DEF5DD] text-[#FAFDFD] font-medium-medium text-xs rounded-2xl py-0 px-6 shadow:none",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-6 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
