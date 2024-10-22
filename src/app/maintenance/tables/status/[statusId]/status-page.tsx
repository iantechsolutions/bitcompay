"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { api } from "~/trpc/react";
import { type MouseEventHandler, useState } from "react";
import { Title } from "~/components/title";
import { Label } from "~/components/ui/label";
import { Loader2, CheckIcon, CircleX, Loader2Icon } from "lucide-react";
import LayoutContainer from "~/components/layout-container";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { type RouterOutputs } from "~/trpc/shared";
import { toast } from "sonner";
import { asTRPCError } from "~/lib/errors";
import { useRouter } from "next/navigation";
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
import CheckmarkCircle02Icon from "~/components/icons/checkmark-circle-02-stroke-rounded";
import Delete02Icon from "~/components/icons/delete-02-stroke-rounded";

export default function StatusPage({
  status,
}: {
  status: NonNullable<RouterOutputs["status"]["get"]>;
}) {
  const { mutateAsync: change, isLoading } = api.status.change.useMutation();
  const [description, setDescription] = useState<string>(status.description!);
  const [code, setCode] = useState<string>(status.code!);
  const router = useRouter();
  async function handleChange() {
    try {
      await change({
        statusId: status.id,
        code,
        description,
      });
      toast.success("Se han guardado los cambios");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>{status.description}</Title>
          <Button disabled={isLoading} onClick={handleChange} className="h-7 bg-[#BEF0BB] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-base rounded-full py-5 px-6"
          >
            {isLoading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
<CheckmarkCircle02Icon className="h-5 mr-2"/>            )}
            Aplicar
          </Button>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="text-md">Info. del estado</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="col-span-2">
                    <div className="col-span-2">
                      <Label htmlFor="code">Código</Label>
                      <Input
                        disabled={true}
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    </div>
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar estado de transacción</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteStatus statusId={status.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteStatus(props: { statusId: string }) {
  const { mutateAsync: DeleteStatus, isLoading } =
    api.status.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    DeleteStatus({ statusId: props.statusId })
      .then(() => {
        toast.success("Se ha eliminado el estado");
        router.push("../status");
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
          Eliminar estado
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Está seguro que quiere eliminar el estado?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar estado permanentemente.
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
