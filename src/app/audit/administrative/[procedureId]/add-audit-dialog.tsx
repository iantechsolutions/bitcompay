"use client";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Interface } from "readline";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";

interface auditDialog {
  procedure_id: string;
}

export function AddAuditDialog(props: auditDialog) {
  const { mutateAsync: createAudit, isLoading } =
    api.administrative_audit.create.useMutation();

  const [description, setDescription] = useState("");
  const [state, setState] = useState("");

    const [open, setOpen] = useState(false)

    const router = useRouter()

  async function handleCreate() {
    try {
      await createAudit({
        description: description,
        state: state,
        procedure_id: props.procedure_id,
      });

      toast.success("Auditoria creada correctamente");
      router.refresh();
      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="rounded-full gap-1 px-4 py-5 text-base text-[#3E3E3E] bg-[#BEF0BB] hover:bg-[#DEF5DD]">
       {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-5 mr-1 stroke-1" />
                )}    
        Crear Auditoria
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nueva auditoria</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="description">Descripcion de la auditoria</Label>
            <Input
              id="description"
              placeholder="..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              placeholder="..."
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
          <DialogFooter className="sm:justify-center">
            <Button className="flex rounded-full w-fit justify-self-center bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#DEF5DD]"
                disabled={isLoading}
                onClick={handleCreate}>
                {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-4 mr-1 stroke-1" />
                )}
              Crear auditoría
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
