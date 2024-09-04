"use client";
import { Loader2Icon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import Delete02Icon from "../icons/delete-02-stroke-rounded";
export default function DeletePrice(props: { priceId?: string }) {
  const { mutateAsync: deletePricePerCondition, isLoading: isDeleting } =
    api.pricePerCondition.delete.useMutation();
  const router = useRouter();
  async function handleDelete() {
    try {
      // setIsLoading(true);
      await deletePricePerCondition({
        id: "",
      });

      // toast.success("Obra social eliminada correctamente");
      router.push("./");
    } catch (e) {
      // const error = asTRPCError(e)!;
      // toast.error(error.message);
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="bg-transparent hover:bg-transparent p-0 text-[#3e3e3e] shadow-none h-5"
        >
          <Delete02Icon className="mr-1 h-4" /> Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>¿Esta seguro de borrar esta vigencia?</DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <Button disabled={isDeleting} onClick={handleDelete}>
            {isDeleting && (
              <Loader2Icon className="mr-2 animate-spin" size={20} />
            )}
            Eliminar vigencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
