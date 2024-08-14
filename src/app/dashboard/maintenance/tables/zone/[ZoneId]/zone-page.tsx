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

export default function ZonePage(props: {
  zone: RouterOutputs["zone"]["get"];
}) {
  const { mutateAsync: updateZone, isLoading } = api.zone.change.useMutation();

  const [name, setName] = useState("");
  const [cp, setCP] = useState("");

  useEffect(() => {
    if (props.zone) {
      setName(props.zone!.name);
      setCP(props.zone!.cp);
    }
  }, [props.zone]);

  const router = useRouter();

  async function handleUpdate() {
    try {
      await updateZone({
        id: props.zone!.id,
        name: name,
        cp: cp,
      });

      toast.success("Zona actualizada correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Editar zona</h1>
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
