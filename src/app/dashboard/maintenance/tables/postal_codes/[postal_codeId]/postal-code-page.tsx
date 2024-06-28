"use client";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useForm } from "react-hook-form";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";

import { toast } from "sonner";
import { Label } from "~/components/ui/label";
import LayoutContainer from "~/components/layout-container";

dayjs.extend(utc);
dayjs.locale("es");

type Inputs = {
  name: string;
  cp: string;
  zone: string;
};

export default function PlanPage(props: { postalCode: string }) {
  const { postalCode } = props;

  const { data: codigoPostal } = api.postal_code.get.useQuery({
    postalCodeId: postalCode,
  });

  const [name, setName] = useState(codigoPostal?.name || "");
  const [cp, setCp] = useState(codigoPostal?.cp || "");
  const [zone, setZone] = useState(codigoPostal?.zone || "");

  const { mutateAsync: updatePlan, isLoading } =
    api.postal_code.change.useMutation();

  const handleUpdate = async (data: Inputs) => {
    try {
      await updatePlan({
        id: codigoPostal!.id,
        name: data.name,
        cp: data.cp,
        zone: data.zone,
      });
      const router = useRouter();

      toast.success("Código postal actualizado correctamente");
      router.reload();
    } catch (e) {
      const error = asTRPCError(e);
      toast.error(
        error?.message || "Hubo un error al actualizar el código postal"
      );
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: { name, cp, zone },
  });

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <h1 className="m-3 text-lg">Actualizar código postal</h1>
        </div>
        <div>
          <form onSubmit={handleSubmit(handleUpdate)} className="m-3">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Nombre"
                {...register("name", { required: true })}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <span>Este campo es requerido</span>}
            </div>
            <div>
              <Label htmlFor="zone">Zona</Label>
              <Input
                id="zone"
                placeholder="Zona"
                {...register("zone", { required: true })}
                onChange={(e) => setZone(e.target.value)}
              />
              {errors.zone && <span>Este campo es requerido</span>}
            </div>
            <div>
              <Label htmlFor="cp">Código postal</Label>
              <Input
                id="cp"
                placeholder="Código postal"
                {...register("cp", { required: true })}
                onChange={(e) => setCp(e.target.value)}
              />
              {errors.cp && <span>Este campo es requerido</span>}
            </div>
            <Button type="submit" disabled={isLoading} className="m-3 ml-0">
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Actualizar Código Postal
            </Button>
          </form>
        </div>
      </section>
    </LayoutContainer>
  );
}
