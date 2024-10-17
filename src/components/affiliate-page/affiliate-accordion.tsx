"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { CircleChevronDown } from "lucide-react";
import * as React from "react";
import { Card } from "../ui/card";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import Edit02Icon from "../icons/edit-02-stroke-rounded";
import EditAffiliate from "./edit-affiliate";
import { RouterOutputs } from "~/trpc/shared";
import EditFamilyGroup from "./edit-familygroup";

const Accordion = AccordionPrimitive.Root;

type CustomTriggerPropsFG = {
  FamilyGroup?: RouterOutputs["family_groups"]["get"];
};
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("mb-5", className)}
    {...props}>
    <Card className="px-6 py-2">{props.children}</Card>
  </AccordionPrimitive.Item>
));
AccordionItem.displayName = "AccordionItem";

// Trigger para Family Groups
const AccordionTriggerFG = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  CustomTriggerPropsFG &
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, FamilyGroup, ...props }, ref) => {
  let editIcon: React.ReactNode;
  const [open, setOpen] = React.useState(false);
  if (props.name === "editIcon" && FamilyGroup) {
    editIcon = (
      <EditFamilyGroup
        familyGroup={FamilyGroup}
        open={open}
        setOpen={setOpen}
      />
    );
  }
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "relative flex flex-1 items-center justify-between py-3 text-lg font-medium transition-all [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}>
        {children}
        {editIcon}
        <CircleChevronDown
          className="h-5 w-7 shrink-0 transition-transform duration-200 z-0"
          strokeWidth={1.3}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTriggerFG.displayName = "AccordionTriggerFG";

// Trigger para Affiliates
type CustomTriggerProps = {
  affiliate?: RouterOutputs["integrants"]["getByGroup"][number];
};

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  CustomTriggerProps &
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, affiliate, ...props }, ref) => {
  let editIcon: React.ReactNode;
  const [open, setOpen] = React.useState(false);
  if (affiliate) {
    editIcon = (
      <EditAffiliate Affiliate={affiliate} open={open} setOpen={setOpen} />
    );
  }

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "relative flex flex-1 items-center justify-between py-3 text-lg font-medium transition-all [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}>
        {children}
        {editIcon}
        <CircleChevronDown
          className="h-5 w-7 shrink-0 transition-transform duration-200 z-0"
          strokeWidth={1.3}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

// Contenido del acordeón
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("pb-3 -mt-3 -ml-5", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export {
  Accordion,
  AccordionItem,
  AccordionTriggerFG,
  AccordionContent,
  AccordionTrigger,
};
