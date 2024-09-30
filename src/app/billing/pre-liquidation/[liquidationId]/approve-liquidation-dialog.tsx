"use client";
import { useState } from "react";
import { currentUser } from "@clerk/nextjs/server";

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
import { CircleCheck, CircleX, Loader2Icon } from "lucide-react";
import CheckmarkCircle02Icon from "~/components/icons/checkmark-circle-02-stroke-rounded";
import AlertDiamondIcon from "~/components/icons/alert-diamond-stroke-rounded";




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
            <DialogTitle className="flex text-lg font-semibold gap-2">
            <AlertDiamondIcon />
             ¿Está seguro? 
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 text-center p-2">
              <p>Los comprobantes van a ser enviadas a la AFIP. </p>
              <p>¿Desea continuar?</p>
            </DialogDescription>
          </DialogHeader>
          {/* Add more dialog content here as needed */}
          <DialogFooter>
        <Button
          className="font-medium-medium text-xs mb-2 rounded-full w-fit justify-items-end bg-[#dddddd] hover:bg-[#cccccc] text-[#3E3E3E]"
          onClick={() => setOpen(false)}>
          <CircleX className="mr-1 text-[#3E3E3E] font-thin h-4" />
          Cancelar 
        </Button>
        <Button
          className="font-medium-medium text-xs mb-2 rounded-full w-fit justify-items-end bg-[#BEF0BB] hover:bg-[#a6eca2] text-[#3E3E3E]"
          type="submit"
          disabled={isLoading}
          onClick={approveLiquidation}>
          {isLoading && (
            <Loader2Icon className="mr-2 animate-spin" size={16} />
          )}
          <CircleCheck className=" mr-1 text-[#3E3E3E] font-thin h-4 " />
          Aprobar preliquidación 
        </Button>
      </DialogFooter>
    </DialogContent>
      </Dialog>
    </>
  );
}

export default UpdateLiquidationEstadoDialog;
