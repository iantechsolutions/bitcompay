"use client";
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
import { Title } from "~/components/title";
import { Loader2, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";

export default function ZonePage(props: {
  zone: RouterOutputs["zone"]["get"];
}) {
  const { mutateAsync: updateZone, isLoading } = api.zone.change.useMutation();
  const { mutateAsync: deleteZone, isLoading: isLoadingDelete } =
    api.zone.delete.useMutation();

  const [name, setName] = useState("");
  const [cp, setCP] = useState("");

  const zoneId = props!.zone!.id ?? "";
  const postalCodes = api.postal_code.getByZone.useQuery({
    zoneId: zoneId,
  });

  useEffect(() => {
    if (props.zone) {
      setName(props.zone!.name);
    }
  }, [props.zone]);

  const router = useRouter();

  async function handleUpdate() {
    try {
      await updateZone({
        id: props.zone!.id,
        name: name,
      });

      toast.success("Zona actualizada correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }
  async function handleDelete() {
    try {
      deleteZone({
        zoneId: zoneId,
      });
      toast.success("Zona eliminada correctamente");
      router.push("./");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <div className="flex justify-between">
        <Title>Editar zona</Title>
        <Button disabled={isLoading} onClick={handleUpdate}>
          {isLoading ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <CheckIcon className="mr-2" />
          )}
          Aplicar
        </Button>
      </div>
      <div className="container mx-auto p-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="text-md">Informacion de zona</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-b pt-3 pl-1">
                <div className="mb-4 col-span-1">
                  <Label htmlFor="description ">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Escriba un nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div></div>
                <div className="mb-4 col-span-1">
                  <Label htmlFor="description">Codigo postal</Label>
                  <Input
                    id="cp"
                    placeholder="Escriba el codigo postal"
                    value={cp}
                    onChange={(e) => setCP(e.target.value)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Codigo postales</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {postalCodes.data && postalCodes.data.length > 0 ? (
                  postalCodes.data.map((postalCode) => (
                    <ListTile
                      key={postalCode.id}
                      title={postalCode.cp ? postalCode.name : postalCode.zone}
                      href={`/maintenance/tables/postal_codes/${postalCode.id}`}
                      leading={postalCode.cp}
                    />
                  ))
                ) : (
                  <Title>No hay códigos postales subidos</Title>
                )}
              </List>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar zona</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-[160px]">
                      Eliminar entidad
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Estás seguro que querés eliminar la entidad?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Eliminar entidad permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600 active:bg-red-700"
                        onClick={handleDelete}
                        disabled={isLoadingDelete}
                      >
                        {isLoadingDelete && (
                          <Loader2 className="mr-2 animate-spin" size={20} />
                        )}
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </LayoutContainer>
  );
}