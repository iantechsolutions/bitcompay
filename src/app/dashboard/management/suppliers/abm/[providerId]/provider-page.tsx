"use client";
import { useRouter } from "next/navigation";
import type { MouseEventHandler } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import ProviderForm from "~/components/provider-form";
import { Title } from "~/components/title";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { asTRPCError } from "~/lib/errors";
import { RouterOutputs } from "~/trpc/shared";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useAuth } from "@clerk/nextjs";
import AccessDenied from "~/app/accessdenied/page";

export default function ProviderPage(props: {
  provider: RouterOutputs["providers"]["get"];
}) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex-col justify-between">
          <Title>{props.provider?.name}</Title>
          <Accordion type="single" collapsible={true}>
            <AccordionItem value="item-1">
              <AccordionTrigger>Informacion de proveedor</AccordionTrigger>
              <AccordionContent>
                <Card className="p-5">
                  <ProviderForm provider={props.provider} />
                </Card>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Eliminar proveedor</AccordionTrigger>
              <AccordionContent>
                <Card className="p-5">
                  <div className="flex justify-end">
                    <DeleteProvider providerId={props.provider!.id} />
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

function DeleteProvider(props: { providerId: string }) {
  const { mutateAsync: deleteProvider, isLoading } =
    api.providers.delete.useMutation();

  const router = useRouter();
  const { orgId } = useAuth();
  if (!orgId) return <AccessDenied />;
  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteProvider({ providerId: props.providerId })
      .then(() => {
        toast.success("Se ha eliminado el proveedor correctamente");
        router.push(`/dashboard/${orgId}/administration/providers`);
        router.refresh();
      })
      .catch((e) => {
        const error = asTRPCError(e)!;
        toast.error(error.message);
      });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar Proveedor
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar este proveedor?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar Proveedor permanentemente.
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
