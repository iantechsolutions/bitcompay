"use client";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Loader2Icon } from "lucide-react";
import Delete02Icon from "~/components/icons/delete-02-stroke-rounded";
import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { asTRPCError } from "~/lib/errors";
const router = useRouter();
export default function DeleteButton(props: { id: string }) {
  async function handleDelete() {
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
  const { mutateAsync: deletePlan, isLoading } = api.plans.delete.useMutation();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  return (
    <>
      <Button
        variant="bitcompay"
        className="text-[#3e3e3e] bg-stone-100 hover:bg-stone-200"
        onClick={()=>setOpenDelete(true)}
      >
        <Delete02Icon className="mr-2" /> Eliminar
      </Button>
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      Seguro que desea eliminar el plan?
                    </DialogTitle>
                  </DialogHeader>

                  <DialogFooter>
                    <Button disabled={isLoading} onClick={handleDelete}>
                      {isLoading && (
                        <Loader2Icon className="mr-2 animate-spin" size={20} />
                      )}
                      Eliminar plan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
    </>
  );
}
