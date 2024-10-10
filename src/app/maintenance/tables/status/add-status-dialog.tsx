"use client";

import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

export function AddStatusDialog() {
  const { mutateAsync: create, isLoading } = api.status.create.useMutation();

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const [open, setOpen] = useState(false);

  const router = useRouter();

  async function handleCreate() {
    try {
      await create({
        description,
        code,
      });

      toast.success("Estado creado correctamente");
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
        Agregar estado de transacción
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo estado</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>

          <div>
            <Label htmlFor="code">Código de estado</Label>
            <Input
              id="code"
              placeholder="0"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="name">Descripción del estado</Label>
            <Input
              id="status_description"
              placeholder="ej: RECHAZADO POR BANCO"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
