"use client";

import { datetime } from "drizzle-orm/mysql-core";
import { date } from "drizzle-orm/pg-core";
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

export function AddModo() {
  const { mutateAsync: createProduct, isLoading } =
    api.modo.create.useMutation();

  const [description, setDescription] = useState("");


  const [open, setOpen] = useState(false);

  const router = useRouter();

  async function handleCreate() {
    try {
      await createProduct({
        description: description

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
        Crear modo
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear un modo</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>
          <div>
            <Label htmlFor="description">name</Label>
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
              Crear modo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
