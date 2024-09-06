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

export function AddProductDialog() {
  const { mutateAsync: createProduct, isLoading } =
    api.products.create.useMutation();

  const [description, setDescription] = useState("");
  const [name, setName] = useState("");

  const [open, setOpen] = useState(false);

  const router = useRouter();

  async function handleCreate() {
    try {
      await createProduct({
        description,
        name,
      });

      toast.success("Producto creado correctamente");
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
        Crear producto
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nuevo producto</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>
          <div>
            <Label htmlFor="name">Nombre del producto</Label>
            <Input
              id="name"
              placeholder="ej: premiun pack xz"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
