"use client";

import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { z } from "zod";
export function AddCompanyDialog() {
  const { mutateAsync: createCompany, isLoading } =
    api.companies.create.useMutation();

  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [concept, setConcept] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const schema = z.object({
    texto: z.string().max(40),
  });
  async function handleCreate() {
    try {
      schema.parse({ texto: concept });
      await createCompany({
        description,
        name,
        concept,
      });

      toast.success("Empresa creado correctamente");
      router.refresh();
      setOpen(false);
    } catch (e) {
      setError("por favor inserte un concept de 40 caracteres o menos");
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Crear empresa
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nueva empresa</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>
          <div>
            <Label htmlFor="name">Nombre de la empresa</Label>
            <Input
              id="name"
              placeholder="ej: bitcompay"
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
          <div>
            <Label htmlFor="concept">Descripción</Label>
            <Input
              id="concept"
              placeholder="..."
              value={concept}
              onChange={(e) => {
                setConcept(e.target.value);
                try {
                  schema.parse({ texto: concept });
                } catch {
                  setError(
                    "el campo concepto no puede superar los 40 caracteres",
                  );
                }
              }}
            />
            <span className="text-xs text-red-600">{error}</span>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              Crear empresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
