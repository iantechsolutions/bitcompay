"use client";

import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";

import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";

import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { useCompanyData } from "../../../company-provider";
import { type RouterOutputs } from "~/trpc/shared";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "~/components/ui/alert-dialog";
import { Card } from "~/components/ui/card";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import StatusForm from "~/components/status-form";

export default function StatusPage(props: {
  status: RouterOutputs["clientStatuses"]["get"];
}) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex-col justify-between">
          <Title>{props.status!.description}</Title>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Editar Estado</AccordionTrigger>
              <AccordionContent>
                <StatusForm status={props.status} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Eliminar Estado</AccordionTrigger>
              <AccordionContent>
                <Card className="p-5">
                  <div className="flex justify-end">
                    <DeleteStatus statusId={props.status!.id} />
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </LayoutContainer>
  );
}

export function DeleteStatus(props: { statusId: string }) {
  const company = useCompanyData();
  const { mutateAsync: deleteStatus, isLoading } =
    api.clientStatuses.delete.useMutation();
  const router = useRouter();
  const handleDelete = async () => {
    try {
      await deleteStatus({ clientStatusId: props.statusId });
      toast.success("unidad eliminado");
      router.push(
        `/dashboard/company/${company.id}/administration/client_statuses`,
      );
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar Estado
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar este estado?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar Estado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 active:bg-red-700"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
