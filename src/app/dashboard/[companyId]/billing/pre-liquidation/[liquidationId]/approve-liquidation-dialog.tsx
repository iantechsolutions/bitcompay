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
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Loader2Icon } from "lucide-react";

function UpdateLiquidationEstadoDialog({
  liquidationId,
  userId,
}: {
  liquidationId: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: updateLiquidation, isLoading } =
    api.liquidations.change.useMutation();
  const { data } = api.liquidations.get.useQuery({ id: liquidationId });
  const approveLiquidation = async () => {
    console.log("Approve liquidation logic goes here");
    await updateLiquidation({
      id: liquidationId,
      estado: "aprobado",
      cuit: data?.cuit ?? "",
      periodo: data?.period ?? new Date(),
      pdv: data?.pdv ?? 0,
      razonSocial: data?.razon_social ?? "",
      userCreated: data?.userCreated ?? "",
      userApproved: userId ?? "",
    });
    setOpen(false);
  };

  return (
    <>
      <Button className="btn-primary" onClick={() => setOpen(true)}>
        Aprobar Liquidacion
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] p-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              ¿Está seguro?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Las facturas van a ser enviadas a la AFIP, incluyendo todos los
              detalles de los montos. Asegúrese de que toda la información es
              correcta antes de proceder.
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
              Aprobar Liquidación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UpdateLiquidationEstadoDialog;
