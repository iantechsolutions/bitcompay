"use client";
import { User } from "@clerk/nextjs/server";
import { CheckIcon, Loader2 } from "lucide-react";
import { type MouseEventHandler, useState } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import { useRouter } from "next/navigation";

type userPageProps = {
  user: User;
};
export default function UserPage(props: userPageProps) {
  const router = useRouter();

  async function handleChange() {
    try {
      toast.success("Se han guardado los cambios");
      router.refresh();
    } catch (e) {}
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title> {props.user?.fullName}</Title>
          <Button onClick={handleChange}>
            <CheckIcon className="mr-2" />
            Aplicar
          </Button>
        </div>

        <Accordion type="single" collapsible={true} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="text-md">Info. del usuario</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5"></Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Roles</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5"></Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}
