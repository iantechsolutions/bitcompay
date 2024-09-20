"use client";
import { useState } from "react";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
import { useForm, type SubmitHandler } from "react-hook-form";
import { cn } from "~/lib/utils";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

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
import { modos } from "~/server/db/schema";
import { Title } from "~/components/title";
import { Label } from "~/components/ui/label";
dayjs.extend(utc);
dayjs.locale("es");

type Inputs = {
  description: string;
};

export default function ModoPage(props: {
  modo: RouterOutputs["modos"]["get"];
}) {
  const modo = props.modo;

  const router = useRouter();
  const [description, setDescription] = useState(modo?.description ?? "");
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const { mutateAsync: updateModo, isLoading } = api.modos.change.useMutation();
  const { mutateAsync: deleteModo, isLoading: isPending } =
    api.modos.delete.useMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  function validateFields() {
    const errors: string[] = [];
    if (!description) errors.push("description");
    return errors;
  }

  async function handleUpdate() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos y sin obligatorios: ${validationErrors.join(
          ", "
        )}`
      );
    }

    try {
      await updateModo({
        id: modo?.id ?? "",
        description: description,
      });

      toast.success("Modo actualizado correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  async function handleDelete() {
    try {
      await deleteModo({
        modosId: modo?.id ?? "",
      });

      toast.success("El modo ha sido eliminado correctamente");
      router.push("/maintenance/tables/modos");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
    router.refresh();
  }

  return (
    <LayoutContainer>
      <div>
        <h1 className=" m-3 text-lg">Actualizar Modo</h1>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={description}
          placeholder="..."
          onChange={(e) => setDescription(e.target.value)}
        />
        {/* {errors.description && <span>Este campo es requerido</span>} */}
      </div>
      <Button disabled={isLoading} onClick={handleUpdate}>
        {isLoading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
        Actualizar Modo
      </Button>

      <Button
        variant={"destructive"}
        className="ml-10"
        onClick={() => setOpenDelete(true)}>
        Eliminar
      </Button>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Seguro que desea eliminar el modo?</DialogTitle>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
            <Button disabled={isDeleting} onClick={handleDelete}>
              {isDeleting && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Eliminar modo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LayoutContainer>
  );
}
