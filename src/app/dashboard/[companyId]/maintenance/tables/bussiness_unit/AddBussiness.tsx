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
  const selectBrandOptions = brands?.map((brand) => (
    <SelectItem key={brand.id} value={brand.id}>
      {" "}
      {brand.name}{" "}
    </SelectItem>
  ));

  async function handleCreate() {
    try {
      await createProduct({
        description: description,
        companyId: props.params.companyId,
        brandId: brand,
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
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="seleccione una marca" />
              </SelectTrigger>
              <SelectContent>{selectBrandOptions}</SelectContent>
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
