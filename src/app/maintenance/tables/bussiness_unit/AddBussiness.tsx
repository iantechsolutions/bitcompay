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
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";

export function AddBussiness(props: { params: { companyId: string } }) {
  const { mutateAsync: createProduct, isLoading } =
    api.bussinessUnits.create.useMutation();

  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const { data: brands } = api.brands.list.useQuery();

  function validateFields() {
    const errors: string[] = [];
    if (!description) errors.push("Descripcion");
    if (!brand) errors.push("Marca");

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
      await createProduct({
        description: description,
        companyId: props.params.companyId,
        brandId: brand,
      });

      toast.success("Unidad creada correctamente");
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
        Crear una unidad de negocio
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear una unidad de negocio</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="description">Descripcion</Label>
            <Input
              id="description"
              placeholder="escriba una descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Marca</Label>
            <Select
              onValueChange={(value) => {
                setBrand(value);
              }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="seleccione una marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {brands
                    ? brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))
                    : null}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
