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

export function AddZones() {
  const { mutateAsync: createZone, isLoading } = api.zone.create.useMutation();

  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  function validateFields() {
    const errors: string[] = [];
    if (!name) errors.push("Nombre");
    return errors;
  }
  async function handleCreate() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos y sin obligatorios: ${validationErrors.join(
          ", "
        )}`
      );
    }

    try {
      await createZone({
        name: name,
      });

      toast.success("Zona creada exitosamente");
      router.refresh();
      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}
        className="rounded-full gap-1 px-4 py-5 text-base text-[#3E3E3E] bg-[#BEF0BB] hover:bg-[#DEF5DD]">
        {isLoading ? (
                   <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                 ) : (
                   <PlusCircleIcon className="h-5 mr-1 stroke-1" />
                 )}  
        Agregar zona
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Zona</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <DialogFooter className="sm:justify-center">
            <Button  className="flex rounded-full w-fit justify-self-center bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#DEF5DD]"
                disabled={isLoading}
                onClick={handleCreate}>
                {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-4 mr-1 stroke-1" />
                )}

              Crear Zona
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
