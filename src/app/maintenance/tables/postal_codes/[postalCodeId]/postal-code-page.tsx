"use client";

import { CircleX, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
import Delete02Icon from "~/components/icons/delete-02-stroke-rounded";

export default function PostalCodePage(props: {
  postalCode: RouterOutputs["postal_code"]["get"];
}) {
  const { mutateAsync: updatePostalCode, isLoading } =
    api.postal_code.change.useMutation();
  const { data: zones } = api.zone.list.useQuery();
  const [name, setName] = useState("");
  const [cp, setCP] = useState("");
  const [zone, setZone] = useState("");

  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const { mutateAsync: deletePostalCode, isLoading: isPending } =
    api.postal_code.delete.useMutation();

  const cpId = props.postalCode!.id;

  useEffect(() => {
    if (props.postalCode) {
      setName(props.postalCode!.name);
      setCP(props.postalCode!.cp);
      setZone(props.postalCode!.zone);
    }
  }, [props.postalCode]);

  const router = useRouter();

  async function handleUpdate() {
    try {
      await updatePostalCode({
        id: cpId,
        name: name,
        zone: zone,
        cp: cp,
      });

      toast.success("Unidad actualizada correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  async function handleDelete() {
    try {
      deletePostalCode({
        postalCodeId: cpId,
      });

      toast.success("El código postal se ha eliminado correctamente");
      router.refresh();
      router.push("/maintenance/tables/postal_codes");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">Editar código postal</h1>
        <div className="mb-4">
          <Label htmlFor="description">Nombre</Label>
          <Input
            id="name"
            placeholder="Escriba un nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="description">Zona</Label>
          <Select value={zone} onValueChange={(e) => setZone(e)}>
            <SelectTrigger className="w-[180px] font-bold">
              <SelectValue placeholder="Seleccionar Zona" />
            </SelectTrigger>
            <SelectContent>
              {zones?.map((zoneItem) => (
                <SelectItem key={zoneItem.id} value={zoneItem.id}>
                  {zoneItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <Label htmlFor="description">Código postal</Label>
          <Input
            id="cp"
            placeholder="0"
            value={cp}
            onChange={(e) => setCP(e.target.value)}
          />
        </div>
        <Button disabled={isLoading} onClick={handleUpdate}>
          {isLoading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
          Actualizar
        </Button>
        <Button
          variant={"destructive"}
          onClick={() => setOpenDelete(true)}
        >
                            <Delete02Icon className="h-4 mr-1" />
          Eliminar
        </Button>
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>¿Desea eliminar el código postal de forma permanente?</DialogTitle>
            </DialogHeader>

            <DialogFooter>
              
              <Button disabled={isPending} onClick={handleDelete}>
              {isPending ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <Delete02Icon className="h-4 mr-1" />
                )} 
                Eliminar código postal
              </Button>
              <Button onClick={() => setOpenDelete(false)}
              className=" bg-[#D9D7D8] hover:bg-[#D9D7D8]/80 text-[#4B4B4B] border-0">
              <CircleX className="flex h-4 mr-1" />Cancelar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LayoutContainer>
  );
}
