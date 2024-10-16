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
  const { mutateAsync: updateFamilyGroup } =
    api.family_groups.change.useMutation();

  useEffect(() => {
    if (familyGroup) {
      setModalidad(familyGroup.modo?.id ?? "");
      setUnidadNegocio(familyGroup.businessUnit ?? "");
      setPlan(familyGroup?.plan?.id ?? "");
      setEstado(familyGroup.state ?? "");
      setBonus(familyGroup.bonus ?? "");
      setEstado(familyGroup.state ?? "");
    }
  }, [familyGroup]);
  function validateFields() {
    const errors: string[] = [];
    if (!modalidad) errors.push("modalidad");
    if (!unidadNegocio) errors.push("unidad de negocio");
    if (!plan) errors.push("plan");
    if (!estado) errors.push("estado");
    if (!motivoBaja) errors.push("motivo de baja");

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
              {/* <Edit02Icon className="mr-1 h-3" /> */}
              <DialogTitle>
                Grupo familiar N° {familyGroup?.numericalId}
              </DialogTitle>
            </div>
          </DialogHeader>

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
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Motivo Baja */}
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

            {/* Zona
            <div>
              <Label htmlFor="zona" className="text-xs mb-2 block">
                Zona
              </Label>
              <Select onValueChange={setZona} value={zona}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione una zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zona1">Zona 1</SelectItem>
                  <SelectItem value="zona2">Zona 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            */}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
              Cancelar
            </Button>
            <Button
              onClick={() => HandleUpdate()}
              className="ml-2 border-green-300 border-0 border-b bg-background text-[#3E3E3E] rounded-none">
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
