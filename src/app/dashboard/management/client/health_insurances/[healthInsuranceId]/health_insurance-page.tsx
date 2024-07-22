"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { type RouterOutputs } from "~/trpc/shared";
import { Loader2Icon } from "lucide-react";
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
dayjs.extend(utc);
dayjs.locale("es");

type Inputs = {
  name: string;
  identificationNumber: string;
};

export default function HealthInsurancePage(props: {
  healthInsurance: RouterOutputs["healthInsurances"]["get"];
}) {
  const router = useRouter();
  const [name, setName] = useState(props.healthInsurance!.name!);
  const [idNumber, setIdNumber] = useState(
    props.healthInsurance!.identificationNumber!
  );

  const [isPending, setIsLoading] = useState<boolean>(false);
  const [openPopover, setOpenPopover] = useState<boolean>(false);

  const { mutateAsync: updateHealthInsurance, isLoading } =
    api.healthInsurances.change.useMutation();

  const { mutateAsync: deleteHealthInsurance } =
    api.healthInsurances.delete.useMutation();

  async function handleUpdate() {
    try {
      await updateHealthInsurance({
        healthInsuranceId: props.healthInsurance!.id,
        name,
        identificationNumber: idNumber,
      });

      toast.success("Obra social actualizada correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  async function handleDelete() {
    try {
      setIsLoading(true);
      await deleteHealthInsurance({
        healthInsuranceId: props.healthInsurance!.id,
      });

      toast.success("Obra social eliminada correctamente");
      router.push("./");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <div>
      <h1 className=" m-3 text-lg">Actualizar Obra Social</h1>
      <div className="m-3">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            placeholder="..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="idNumber">Numero de Identificacion</Label>
          <Input
            id="idNumber"
            placeholder="..."
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
        </div>
      </div>
      <Button disabled={isLoading} onClick={handleUpdate} className="m-3 ml-0">
        {isLoading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
        Actualizar
      </Button>

      <AlertDialog open={openPopover}>
        <AlertDialogTrigger asChild={true}>
          <Button
            variant="destructive"
            className="w-[160px]"
            disabled={isPending}
            onClick={() => setOpenPopover(true)}>
            {isPending && (
              <Loader2Icon className="mr-2 animate-spin" size={20} />
            )}
            Eliminar Marca
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro que querés eliminar la marca?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Eliminar marca permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 active:bg-red-700 hover:bg-red-600"
              onClick={handleDelete}
              disabled={isPending}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
