"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { type RouterOutputs } from "~/trpc/shared";
import { Loader2Icon } from "lucide-react";
dayjs.extend(utc);
dayjs.locale("es");

type Inputs = {
  name: string;
  identificationNumber: string;
};

export default function HealthInsurancePage(props: {
  healthInsurance: RouterOutputs["healthInsurances"]["get"];
}) {
  const router = useRouter();
  const [name, setName] = useState(props.healthInsurance!.name!);
  const [idNumber, setIdNumber] = useState(
    props.healthInsurance!.identificationNumber!
  );

  const { mutateAsync: updateHealthInsurance, isLoading } =
    api.healthInsurances.change.useMutation();

  async function handleUpdate() {
    try {
      await updateHealthInsurance({
        healthInsuranceId: props.healthInsurance!.id,
        name,
        identificationNumber: idNumber,
      });

      toast.success("Obra social actualizada correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <div>
      <h1 className=" m-3 text-lg">Actualizar Obra Social</h1>
      <div className="m-3">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            placeholder="..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="idNumber">Numero de Identificacion</Label>
          <Input
            id="idNumber"
            placeholder="..."
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
        </div>
      </div>
      <Button disabled={isLoading} onClick={handleUpdate} className="m-3 ml-0">
        {isLoading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
        Actualizar
      </Button>
    </div>
  );
}
