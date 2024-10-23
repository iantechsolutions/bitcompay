"use client";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CirclePlus } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { RouterOutputs } from "~/trpc/shared";
import { asTRPCError } from "~/lib/errors";
import { set } from "date-fns";

interface EditAffiliateProps {
  Affiliate?: RouterOutputs["integrants"]["getByGroup"][number];
}

export default function AddDifferentials({ Affiliate }: EditAffiliateProps) {
  const { mutateAsync: crearDiferenciales, isLoading } =
    api.differentialsValues.create.useMutation();

  const { mutateAsync: editarDiferenciales, isLoading: isPending } =
    api.differentialsValues.change.useMutation();

  const { data: diferenciales } = api.differentials.list.useQuery();
  const { data: dif } = api.differentialsValues.getByIntegranteId.useQuery({
    integrantId: Affiliate?.id ?? "",
  });
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState(dif?.differentialId ?? "");
  const [monto, setMonto] = useState(dif?.amount ?? 0);

  useEffect(() => {
    if (dif) {
      setMonto(dif.amount ?? 0);
      setTipo(dif.differentialId ?? "");
    }
  }, [dif]);

  function validateFields() {
    const errors: string[] = [];
    if (!tipo) errors.push("tipo");
    if (!monto) errors.push("monto");
    return errors;
  }

  async function addDiferenciales() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
    }

    if (!dif) {
      try {
        await crearDiferenciales({
          differentialId: tipo,
          amount: monto,
          integrant_id: Affiliate?.id ?? "",
        });
        toast.success("Diferencial agregado");
      } catch (e) {
        const error = asTRPCError(e)!;
        toast.error(error.message);
        setOpen(false);
      }
    } else {
      try {
        await editarDiferenciales({
          differentialValueId: dif?.id ?? "",
          differentialId: tipo,
          amount: monto,
          integrant_id: Affiliate?.id ?? "",
        });
        toast.success("Diferencial editado");
        setOpen(false);
      } catch (e) {
        const error = asTRPCError(e)!;
        toast.error(error.message);
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="text-sm px-4 h-5 justify-center text-[#3e3e3e] rounded-full font-medium z-0"
          variant={"bitcompay"}>
          <CirclePlus className="p-0 h-4 stroke-1" />
          Diferencial
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-white p-4 shadow-md rounded-md z-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">
            Diferencial para {Affiliate?.name ?? "-"}
          </h2>
          <div>
            <label htmlFor="monto">Monto del diferencial</label>
            <Input
              id="monto"
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
              placeholder="..."
              type="number"
            />
          </div>
          <div>
            <label htmlFor="tipo">Tipo de diferencial</label>
            <Select
              value={tipo}
              onValueChange={(value) => setTipo(value)}
              defaultValue="Tipo">
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {diferenciales?.map((diferencial) => (
                  <SelectItem key={diferencial.id} value={diferencial.id}>
                    {diferencial.codigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setOpen(false)}
              className="bg-[#F7F7F7] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-xs rounded-full py-1 px-5">
              Cancelar
            </Button>
            <Button
              className="text-current text-sm"
              variant={"bitcompay"}
              onClick={addDiferenciales}
              disabled={isLoading}>
              Guardar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
