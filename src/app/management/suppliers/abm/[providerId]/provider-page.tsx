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
import Delete02Icon from "~/components/icons/delete-02-stroke-rounded";
import { Loader2Icon, CircleX } from "lucide-react";

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
              <AccordionTrigger>Información de proveedor</AccordionTrigger>
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
        router.push(`/${orgId}/administration/providers`);
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
        <Button variant="destructive">
        <Delete02Icon className="h-4 mr-1 font-medium place-content-center" />
          Eliminar Proveedor
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Está seguro que quiere eliminar este proveedor?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar Proveedor permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
        <AlertDialogAction
            className="bg-[#f9c3c3] hover:bg-[#f9c3c3]/80 text-[#4B4B4B] text-sm rounded-full py-4 px-4 shadow-none"
            onClick={handleDelete}
            disabled={isLoading}>
            {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <Delete02Icon className="h-4 mr-1" />
                )}            
  Eliminar
          </AlertDialogAction>
          <AlertDialogCancel className=" bg-[#D9D7D8] hover:bg-[#D9D7D8]/80 text-[#4B4B4B] border-0">
          <CircleX className="flex h-4 mr-1" />
            Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
