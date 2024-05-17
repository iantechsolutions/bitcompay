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

export function AddAuditDialog(props: auditDialog ) {


  const { mutateAsync: createAudit, isLoading } =
    api.administrative_audit.create.useMutation();

  const [description, setDescription] = useState("");
  const [state, setState] = useState("");

  const [open, setOpen] = useState(false);

  const router = useRouter();

  async function handleCreate() {
    try {
      await createAudit({
        description,
        state,
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
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
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
          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear auditoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
