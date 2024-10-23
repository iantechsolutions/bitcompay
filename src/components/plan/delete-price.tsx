"use client";
import { CircleX, Loader2Icon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import Delete02Icon from "../icons/delete-02-stroke-rounded";
import { asTRPCError } from "~/lib/errors";
import { useState } from "react";

export default function DeletePrice(props: {
  planId: string;
  currentVigency: Date | undefined;
  onDelete: () => Promise<void>; // Nueva prop
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: deletePricePerCondition, isLoading: isDeleting } =
    api.pricePerCondition.deleteByPlanAndDate.useMutation();
  const router = useRouter();

  async function handleDelete() {
    try {
      if (props.currentVigency) {
        router.push("/management/sales/plans/" + props.planId);
        await props.onDelete();
        setIsOpen(false);
      }
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-transparent hover:bg-transparent p-0 text-[#3e3e3e] shadow-none h-5"
          onClick={() => setIsOpen(true)} // Abre el diálogo
        >
          <Delete02Icon className="mr-1 h-4" /> Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>¿Está seguro de borrar esta vigencia?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={isDeleting} onClick={handleDelete}>
          {isDeleting ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <Delete02Icon className="h-4 mr-1" />
                )}  
            Eliminar vigencia
          </Button>
          <Button disabled={isDeleting} onClick={() => setIsOpen(false)}className=" bg-[#D9D7D8] hover:bg-[#D9D7D8]/80 text-[#4B4B4B] border-0">
          {isDeleting ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
            <CircleX className="flex h-4 mr-1" />                )}  
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
