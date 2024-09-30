"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "~/lib/utils";
import { RouterOutputs } from "~/trpc/shared";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

type CustomTriggerProps = {
  relationship?: string | null;
  affiliate?: RouterOutputs["integrants"]["getByGroup"][number];
};
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> &
    CustomTriggerProps
>(({ className, children, relationship, affiliate, ...props }, ref) => {
  const isHolder = affiliate?.relationship === "Titular";
  const isBillResponsible= affiliate?.isBillResponsible;
  const isAffiliate = affiliate?.isAffiliate;
  const badgeClassName = `rounded-full px-3 py-1 text-xs font-bold
  ${isHolder ? "bg-[#DDF9CC] text-[#4C740C] " : "text-[#3E3E3E]"} `;
  return (
    <AccordionPrimitive.Header className="flex items-center">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-2 px-6 w-full font-medium text-sm bg-[#f7f7f7] rounded-full transition-all [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <div className="flex gap-10 items-center">
          <div className={badgeClassName}>
          {isHolder ? "Titular " : ""}
          {isBillResponsible ? "Responsable pagador " : ""}
          {isAffiliate ? "Afiliado " : ""}	
          {!isHolder && !isBillResponsible && !isAffiliate ? "Adherente" : ""}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pt-3 pb-3 px-6", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
