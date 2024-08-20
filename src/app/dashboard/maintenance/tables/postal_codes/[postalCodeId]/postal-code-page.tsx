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

export default function PostalCodePage(props: {
  postalCode: RouterOutputs["postal_code"]["get"];
}) {
  const { mutateAsync: updatePostalCode, isLoading } =
    api.postal_code.change.useMutation();
  const { data: zones } = api.zone.list.useQuery();
  const [name, setName] = useState("");
  const [cp, setCP] = useState("");
  const [zone, setZone] = useState("");

  useEffect(() => {
    if (props.postalCode) {
      setName(props.postalCode!.name);
      setCP(props.postalCode!.cp);
      setZone(props.postalCode!.zone);
    }
  }, [props.postalCode]);

  const router = useRouter();

  async function handleUpdate() {
    try {
      await updatePostalCode({
        id: props.postalCode!.id,
        name: name,
        zone: zone,
        cp: cp,
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
      <h1 className="text-xl font-semibold mb-4">Editar Codigo postal</h1>
      <div className="mb-4">
        <Label htmlFor="description">Nombre</Label>
        <Input
          id="name"
          placeholder="Escriba un nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="description">Zona</Label>
        <Select value={zone} onValueChange={(e) => setZone(e)}>
          <SelectTrigger className="w-[180px] font-bold">
            <SelectValue placeholder="Seleccionar Zona" />
          </SelectTrigger>
          <SelectContent>
            {zones?.map((zoneItem) => (
              <SelectItem key={zoneItem.id} value={zoneItem.id}>
                {zoneItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mb-4">
        <Label htmlFor="description">Codigo postal</Label>
        <Input
          id="cp"
          placeholder="Escriba el codigo postal"
          value={cp}
          onChange={(e) => setCP(e.target.value)}
        />
      </div>
      <Button disabled={isLoading} onClick={handleUpdate}>
        {isLoading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
        Actualizar
      </Button>
    </div>
  );
}
