"use client";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Loader2Icon, Trash2 } from "lucide-react";
import Delete02Icon from "~/components/icons/delete-02-stroke-rounded";
import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { asTRPCError } from "~/lib/errors";

export default function DeleteButton(props: { id: string }) {
  const router = useRouter();
  const planId = props?.id;
  const [error, setError] = useState<boolean>(false);
  const { data: familiGroups } = api.family_groups.getbyPlans.useQuery({
    planId: planId,
  });
  async function handleDelete() {
    if (familiGroups) {
      setError(true);
      return toast.error("No se pudo eliminar el plan");
    } else {
      try {
        await deletePlan({
          planId: props.id ?? "",
        });

        toast.success("El plan se eliminado correctamente");
        router.push("/dashboard/management/sales/plans");
        router.refresh();
      } catch (e) {
        const error = asTRPCError(e)!;
        toast.error(error.message);
      }
    }
  }
  const { mutateAsync: deletePlan, isLoading } = api.plans.delete.useMutation();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  return (
    <>
      <Button
        variant="bitcompay"
        className="text-[#3e3e3e] bg-stone-100 hover:bg-stone-200"
        onClick={() => setOpenDelete(true)}>
        <Delete02Icon className="mr-2" /> Eliminar
      </Button>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="p-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="m-2 font-medium text-center pr-6">
              ¿Seguro que desea eliminar el plan?
            </DialogTitle>
          </DialogHeader>

          {error && (
            <p className="text-red-500 text-center">
              {" "}
              Hay grupos familiares relacionados a este plan
            </p>
          )}
          <div className="w-full flex justify-center">
            <Button
              type="submit"
              className="rounded-full bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#BEF0BB]"
              disabled={isLoading || error}
              onClick={handleDelete}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              <Delete02Icon className="m-2 font-medium place-content-center" />
              <h1 className="font-medium-medium p-1">Eliminar</h1>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
