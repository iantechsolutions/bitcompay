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
import InsuranceForm from "~/components/insurances-form";

export default function InsurancePage(props: {
  insurance: RouterOutputs["healthInsurances"]["get"];
}) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex-col justify-between">
          <Title>{props.insurance!.name}</Title>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Editar Obra social</AccordionTrigger>
              <AccordionContent>
                <InsuranceForm insurance={props.insurance} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Eliminar Obra social</AccordionTrigger>
              <AccordionContent>
                <Card className="p-5">
                  <div className="flex justify-end">
                    <DeleteInsurance insuranceId={props.insurance!.id} />
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

export function DeleteInsurance(props: { insuranceId: string }) {
  const company = useCompanyData();
  const { mutateAsync: deleteInsurance, isLoading } =
    api.healthInsurances.delete.useMutation();
  const router = useRouter();
  const handleDelete = async () => {
    try {
      await deleteInsurance({ healthInsuranceId: props.insuranceId });
      toast.success("unidad eliminado");
      router.push(
        `/dashboard/company/${company.id}/administration/bussiness_units`,
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
          Eliminar Unidad
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar esta unidad?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar Unidad permanentemente.
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
