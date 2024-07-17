"use client";
import { useState } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { CircleX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Loader2Icon } from "lucide-react";
export default function RejectLiquidationDialog({
  liquidationId,
}: {
  liquidationId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutateAsync: rejectLiquidation, isLoading } =
    api.liquidations.rejectLiquidation.useMutation();
  const approveLiquidation = async () => {
    await rejectLiquidation({
      liquidationId: liquidationId,
    });

    router.push("./");
  };

  return (
    <>
      <Button
        className="  h-7 bg-[#c2c0c0] hover:bg-[#7e7c7c] text-[#686767]  text-xs rounded-2xl py-0 px-6"
        onClick={() => setOpen(true)}
      >
        Anular
        <CircleX className="h-4 w-auto ml-2" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] p-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              ¿Está seguro?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Esta acción no se puede deshacer. ¿Está seguro de que desea anular
              la liquidación?
            </DialogDescription>
          </DialogHeader>
          {/* Add more dialog content here as needed */}
          <DialogFooter>
            <Button
              className="btn-secondary mr-2"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="btn primary"
              type="submit"
              disabled={isLoading}
              onClick={approveLiquidation}
            >
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Anular Liquidación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
