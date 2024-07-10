"use client";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
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

export function AddBrandDialog() {
  const { mutateAsync: createBrand, isLoading } =
    api.brands.create.useMutation();
  const [reducedDescription, setReducedDescription] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const schema = z.object({
    texto: z.string().max(10),
  });

  async function handleCreate() {
    try {
      schema.parse({ texto: reducedDescription });
      await createBrand({
        description,
        name,
        redescription: reducedDescription,
      });

      toast.success("Marca creada correctamente");
      router.refresh();
      setOpen(false);
    } catch (e) {
      setError(
        "No se puede asignar una descripcion reducidad de mas de 10 caracteres"
      );
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Crear marca
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nueva marca</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="name">Nombre de la marca</Label>
            <Input
              id="name"
              placeholder="..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={true}
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

          <div>
            <Label htmlFor="description_reducida">Descripción Reducida</Label>
            <Input
              id="description_reducida"
              placeholder="..."
              value={reducedDescription}
              onChange={(e) => {
                setReducedDescription(e.target.value);
                try {
                  schema.parse({ texto: reducedDescription });
                } catch {
                  setError(
                    "por favor inserte una descripcion reducida de 10 caracteres o menos"
                  );
                }
              }}
            />
            {error && <span className="text-red-600 text-xs">{error}</span>}
          </div>

          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear marca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
