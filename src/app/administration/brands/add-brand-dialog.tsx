"use client";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { ComboboxDemo } from "~/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";

export function AddBrandDialog() {
  const { mutateAsync: createBrand, isLoading } =
    api.brands.create.useMutation();
  const [reducedDescription, setReducedDescription] = useState("");
  const [description, setDescription] = useState("");
  const [iva, setIva] = useState<string>("21%");
  const [name, setName] = useState("");
  const [utility, setUtility] = useState("");

  const [code, setCode] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [concept, setConcepto] = useState("");

  // const [billType, setBillType] = useState<string>("");

  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const schema = z.object({
    texto: z.string().max(10),
  });

  async function handleCreate() {
    try {
      if (!name || !code || !description || !iva || !reducedDescription) {
        setError("Todos los campos son obligatorios.");
        return;
      }

      schema.parse({ texto: reducedDescription });
      await createBrand({
        iva: iva.toString(),
        description,
        name,
        code,
        utility,
        redescription: reducedDescription,
        concept,
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear nueva marca</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nombre de la marca */}
            <div>
              <Label htmlFor="name">Nombre de la marca</Label>
              <Input
                id="name"
                placeholder="..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="razonSocial">Razon social la marca</Label>
              <Input
                id="razonSocial"
                placeholder="..."
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="concept">Concepto</Label>
              <Select
                onValueChange={(e) => setConcepto(e)}
                value={concept ?? ""}>
                <SelectTrigger className="w-[180px] font-bold">
                  <SelectValue placeholder="Seleccionar concepto..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Productos</SelectItem>
                  <SelectItem value="2">Servicios</SelectItem>
                  <SelectItem value="3">Productos y Servicios</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Código de marca */}
            <div className="flex">
              <div className="w-[250px] font-bold">
                <Label htmlFor="code">Código de marca(max. 4 carac)</Label>
                <Input
                  id="code"
                  placeholder="..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={4}
                />
              </div>
              <div className="w-[250px] font-bold">
                <Label htmlFor="utility">Código de utilidad(senapsa)</Label>
                <Input
                  id="utility"
                  placeholder="..."
                  value={utility}
                  onChange={(e) => setUtility(e.target.value)}
                  maxLength={8}
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* IVA, Tipo de factura y Descripción Reducida */}
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <div>
                <Label htmlFor="iva">IVA</Label>
                <Select onValueChange={(e) => setIva(e)}>
                  <SelectTrigger className="w-[180px] font-bold">
                    <SelectValue placeholder="Seleccionar IVA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">0%</SelectItem>
                    <SelectItem value="9">2.5%</SelectItem>
                    <SelectItem value="8">5%</SelectItem>
                    <SelectItem value="4">10.5%</SelectItem>
                    <SelectItem value="5">21%</SelectItem>
                    <SelectItem value="6">27%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción Reducida */}
            <div className="mt-4">
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
                      "Por favor inserte una descripción reducida de 10 caracteres o menos"
                    );
                  }
                }}
              />
              {error && <span className="text-red-600 text-xs">{error}</span>}
            </div>
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
