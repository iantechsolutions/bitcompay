"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover } from "~/components/ui/popover";
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
import LayoutContainer from "~/components/layout-container";

export default function EditBusinessUnit(props: {
  params: { companyId: string; unitId: string };
  businessUnit: RouterOutputs["bussinessUnits"]["get"];
}) {
  const businessUnit = props.businessUnit;
  const { mutateAsync: updateBusinessUnit, isLoading } =
    api.bussinessUnits.change.useMutation();

  const { mutateAsync: deleteBussinessUnit } =
    api.bussinessUnits.delete.useMutation();

  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const { data: brands } = api.brands.list.useQuery();

  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");

  useEffect(() => {
    if (businessUnit) {
      setDescription(businessUnit.description);
      setBrand(businessUnit.brandId);
    }
  }, [businessUnit]);

  const router = useRouter();
  const selectBrandOptions = brands?.map((brand) => (
    <SelectItem key={brand.id} value={brand.id}>
      {brand.name}
    </SelectItem>
  ));

  async function handleUpdate() {
    try {
      await updateBusinessUnit({
        bussinessUnitId: businessUnit!.id,
        description: description,
        companyId: businessUnit!.companyId,
        brandId: brand,
      });

      toast.success("Unidad actualizada correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  async function handleDelete() {
    try {
      deleteBussinessUnit({
        bussinessUnitId: businessUnit!.id,
      });

      toast.success("El plan se eliminado correctamente");
      router.refresh();
      router.push("/dashboard/maintenance/tables/bussiness_unit");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="container mx-auto p-4">
          <h1 className="text-xl font-semibold mb-4">
            Editar Unidad de Negocio
          </h1>
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
              }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione una marca" />
              </SelectTrigger>
              <SelectContent>{selectBrandOptions}</SelectContent>
            </Select>
          </div>

          <div className="justify-between">
            <Button disabled={isLoading} onClick={handleUpdate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Actualizar
            </Button>

            <Button className="ml-10" onClick={() => setOpenDelete(true)}>
              {" "}
              Eliminar
            </Button>

            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Seguro que desea elimnar el plan?</DialogTitle>
                </DialogHeader>

                <DialogFooter>
                  <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
                  <Button disabled={isLoading} onClick={handleDelete}>
                    {isLoading && (
                      <Loader2Icon className="mr-2 animate-spin" size={20} />
                    )}
                    Eliminar unidad de negocio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </LayoutContainer>
  );
}
