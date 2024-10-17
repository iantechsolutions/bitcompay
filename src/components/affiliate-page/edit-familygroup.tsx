import { useEffect, useState } from "react";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RouterOutputs } from "~/trpc/shared";
import { Input } from "../ui/input";

interface EditFamilyGroupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  familyGroup: RouterOutputs["family_groups"]["get"];
}

export default function EditFamilyGroup({
  open,
  setOpen,
  familyGroup,
}: EditFamilyGroupProps) {
  const { data: plans } = api.plans.list.useQuery();
  const { data: modos } = api.modos.list.useQuery();
  const { data: businessUnits } = api.bussinessUnits.list.useQuery();

  const [modalidad, setModalidad] = useState(familyGroup?.modo?.id ?? "");
  const [unidadNegocio, setUnidadNegocio] = useState(
    familyGroup?.businessUnit ?? ""
  );
  const [plan, setPlan] = useState(familyGroup?.plan?.id ?? "");
  const [estado, setEstado] = useState(familyGroup?.state ?? "");
  const [motivoBaja, setMotivoBaja] = useState("");
  const [bonus, setBonus] = useState(familyGroup?.bonus ?? "");
  const router = useRouter();
  const { mutateAsync: updateFamilyGroup, isLoading } =
    api.family_groups.change.useMutation();

  function validateFields() {
    const errors: string[] = [];
    if (!modalidad) errors.push("modalidad");
    if (!unidadNegocio) errors.push("unidad de negocio");
    if (!plan) errors.push("plan");
    if (!estado) errors.push("estado");

    return errors;
  }

  async function HandleUpdate() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
    }

    try {
      await updateFamilyGroup({
        id: familyGroup?.id ?? "",
        businessUnit: unidadNegocio,
        validity: new Date(),
        plan: plan,
        modo: modalidad,
        // bonus: bonus,
        state: estado,
        sale_condition: motivoBaja,
      });
      setOpen(false);
      router.refresh();
      toast.success("Grupo actualizado correctamente");
    } catch (e) {
      return toast.error("No se pudo guardar los cambios");
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="bitcompay"
        className="absolute right-10 text-sm px-4 h-5 justify-center text-[#3e3e3e] rounded-full font-medium z-0">
        <Edit02Icon className="h-3" /> Editar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] gap-4 m-4 rounded-2xl p-4">
          <DialogHeader>
            <div className="flex items-center">
              <DialogTitle>
                Grupo familiar N° {familyGroup?.numericalId}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Información General */}
          <h3 className="text-lg font-semibold mt-4 mb-2">
            Información General
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Modalidad */}
            <div>
              <Label htmlFor="modalidad" className="text-xs mb-2 block">
                Modalidad
              </Label>
              <Select onValueChange={setModalidad} value={modalidad}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione una modalidad" />
                </SelectTrigger>
                <SelectContent>
                  {modos?.map((modo) => (
                    <SelectItem key={modo.id} value={modo.id}>
                      {modo.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan */}
            <div>
              <Label htmlFor="plan" className="text-xs mb-2 block">
                Plan
              </Label>
              <Select onValueChange={setPlan} value={plan}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unidad de Negocio */}
            <div>
              <Label htmlFor="unidadNegocio" className="text-xs mb-2 block">
                Unidad de Negocio
              </Label>
              <Select onValueChange={setUnidadNegocio} value={unidadNegocio}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione una unidad de negocio" />
                </SelectTrigger>
                <SelectContent>
                  {businessUnits?.map((un) => (
                    <SelectItem key={un.id} value={un.id}>
                      {un.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="estado" className="text-xs mb-2 block">
                Estado
              </Label>
              <Select onValueChange={setEstado} value={estado}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {estado === "INACTIVO" && (
              <div>
                <Label htmlFor="motivoBaja" className="text-xs mb-2 block">
                  Motivo de Baja
                </Label>
                <Select onValueChange={setMotivoBaja} value={motivoBaja}>
                  <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                    <SelectValue placeholder="Seleccione un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivo1">Motivo 1</SelectItem>
                    <SelectItem value="motivo2">Motivo 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Separador para la Información Fiscal */}
          {/* <h3 className="text-lg font-semibold mt-6 mb-2">
            Información Fiscal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"> */}
          {/* Aquí puedes añadir más campos relacionados con la información fiscal */}
          {/* Ejemplo de campos de información fiscal */}
          {/* <div>
              <Label htmlFor="fiscalIdType" className="text-xs mb-2 block">
                Tipo de ID Fiscal
              </Label>
              <Select onValueChange={setFiscalIdType} value={fiscalIdType}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione un tipo de ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tipo1">Tipo 1</SelectItem>
                  <SelectItem value="tipo2">Tipo 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fiscalIdNumber" className="text-xs mb-2 block">
                Número de ID Fiscal
              </Label>
              <Input
                type="text"
                id="fiscalIdNumber"
                value={fiscalIdNumber}
                onChange={(e) => setFiscalIdNumber(e.target.value)}
                placeholder="Ingrese el número de ID"
              />
            </div> */}

          {/* Otros campos fiscales pueden ser añadidos aquí */}
          {/* </div> */}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className=" bg-[#F7F7F7] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-xs rounded-full py-1 px-5">
              Cancelar
            </Button>
            <Button
              disabled={isLoading}
              onClick={() => HandleUpdate()}
              variant="bitcompay"
              className="font-medium text-xs rounded-full py-1 px-5  text-[#3e3e3e] z-0">
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
