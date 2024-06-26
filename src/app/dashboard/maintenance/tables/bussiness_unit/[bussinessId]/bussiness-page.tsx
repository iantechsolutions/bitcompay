"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";

export default function EditBusinessUnit(props: {
  params: { companyId: string; unitId: string };
  businessUnit: RouterOutputs["bussinessUnits"]["get"];
}) {
  const { mutateAsync: updateBusinessUnit, isLoading } =
    api.bussinessUnits.change.useMutation();
  const { data: brands } = api.brands.list.useQuery();

  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");

  useEffect(() => {
    if (props.businessUnit) {
      setDescription(props.businessUnit.description);
      setBrand(props.businessUnit.brandId);
    }
  }, [props.businessUnit]);

  const router = useRouter();
  const selectBrandOptions = brands?.map((brand) => (
    <SelectItem key={brand.id} value={brand.id}>
      {brand.name}
    </SelectItem>
  ));

  async function handleUpdate() {
    try {
      await updateBusinessUnit({
        bussinessUnitId: props.params.unitId,
        description: description,
        companyId: props.params.companyId,
        brandId: brand,
      });

      toast.success("Unidad actualizada correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Editar Unidad de Negocio</h1>
      <div className="mb-4">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          placeholder="Escriba una descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="brand">Marca</Label>
        <Select
          value={brand}
          onValueChange={(value) => {
            setBrand(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione una marca" />
          </SelectTrigger>
          <SelectContent>{selectBrandOptions}</SelectContent>
        </Select>
      </div>
      <Button disabled={isLoading} onClick={handleUpdate}>
        {isLoading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
        Actualizar
      </Button>
    </div>
  );
}
