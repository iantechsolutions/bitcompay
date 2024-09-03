"use client";
import { useState } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { CircleCheck, CircleX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Loader2Icon } from "lucide-react";
import CheckmarkCircle02Icon from "~/components/icons/checkmark-circle-02-stroke-rounded";




function UpdateLiquidationEstadoDialog({
  liquidationId,
  userId,
}: {
  liquidationId: string;
  userId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutateAsync: updateLiquidation, isLoading } =
    api.comprobantes.approvePreLiquidation.useMutation();
  const { data } = api.liquidations.get.useQuery({ id: liquidationId });
  const approveLiquidation = async () => {
    await updateLiquidation({
      liquidationId: liquidationId,
    });

    router.push("./");
  };


  return (
    <>
      <Button
        className="h-7 bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3e3e3e] font-medium text-base rounded-full py-5 px-6"
        onClick={() => setOpen(true)}>
        <CheckmarkCircle02Icon className="h-5 mr-2"/>
        Aprobar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] p-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              ¿Está seguro?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Los comprobantes van a ser enviadas a la AFIP, incluyendo todos
              los detalles de los montos. Asegúrese de que toda la información
              es correcta antes de proceder.
            </DialogDescription>
          </DialogHeader>
          {/* Add more dialog content here as needed */}
          <DialogFooter>
        <Button
          className="h-7 bg-[#D9D7D8] hover:bg-[#d9d7d8dc] text-[#4B4B4B]  text-xs rounded-2xl py-0 px-6"
          onClick={() => setOpen(false)}>
          Cancelar <CircleX className="h-4 w-auto ml-2" />
        </Button>
        <Button
          className="h-7 bg-[#0DA485] hover:bg-[#0da486e2] text-[#FAFDFD] font-medium-medium text-xs rounded-2xl py-0 px-6"
          type="submit"
          disabled={isLoading}
          onClick={approveLiquidation}>
          {isLoading && (
            <Loader2Icon className="mr-2 animate-spin" size={20} />
          )}
          Aprobar Liquidación <CircleCheck className="h-4 w-auto ml-2" />
        </Button>
      </DialogFooter>
    </DialogContent>
      </Dialog>
    </>
  );
}

export default UpdateLiquidationEstadoDialog;
