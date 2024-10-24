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

export function AddChannelDialog() {
  const { mutateAsync: createChannel, isLoading } =
    api.channels.create.useMutation();

  const [description, setDescription] = useState("");
  const [name, setName] = useState("");

  const [open, setOpen] = useState(false);

  const router = useRouter();

  function validateFields() {
    const errors: string[] = [];
    if (!description) errors.push("Descripción");
    if (!name) errors.push("Nombre del canal");

    return errors;
  }
  
  async function handleCreate() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
    }
    try {
      await createChannel({
        description,
        name: name.toUpperCase(),
      });
      toast.success("Canal creado correctamente");
      setOpen(false);
      setTimeout(() => {
        router.refresh(); 
      }, 500); 
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
        Crear canal
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo canal</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>
          <div>
            <Label htmlFor="name">Nombre del canal</Label>
            <Input
             id="name"
            value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20} 
          className="truncate"
                    />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
               maxLength={50} 
          className="truncate"
            />
          </div>
          <DialogFooter className="sm:justify-center">
            <Button disabled={isLoading} onClick={handleCreate}
            className="flex rounded-full w-fit justify-self-center bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#DEF5DD]">
              {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-4 mr-1 stroke-1" />
                )}
              Crear canal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
