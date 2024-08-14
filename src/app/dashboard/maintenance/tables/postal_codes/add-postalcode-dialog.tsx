"use client";

import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";

export function AddPostalCode() {
  const { mutateAsync: createPostalCode, isLoading } =
    api.postal_code.create.useMutation();
  const { data: zones } = api.zone.list.useQuery();

  const [name, setName] = useState("");
  const [cp, setCp] = useState("");

  const [zone, setZone] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  async function handleCreate() {
    if (!zones?.some((zoneItem) => zoneItem.name === zone)) {
      toast.error("La zona no es válida");
      return;
    }

    try {
      await createPostalCode({
        cp: cp,
        name: name,
        zone: zone,
      });

      toast.success("Código postal creado exitosamente");
      router.refresh();
      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (zone) {
      const filteredSuggestions =
        zones
          ?.filter((zoneItem) =>
            zoneItem.name.toLowerCase().startsWith(zone.toLowerCase())
          )
          .map((zoneItem) => zoneItem.name) || [];
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [zone, zones]);

  function handleZoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setZone(e.target.value);
  }

  function handleSuggestionClick(suggestion: string) {
    setZone(suggestion);
    setSuggestions([]);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Agregar Código Postal
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Código Postal</DialogTitle>
          </DialogHeader>
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
            <Label htmlFor="cp">Codigo postal</Label>
            <Input
              id="cp"
              placeholder="..."
              value={cp}
              onChange={(e) => setCp(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="zone">Zona</Label>
            <Input
              id="zone"
              type="text"
              placeholder="..."
              value={zone}
              onChange={handleZoneChange}
            />
            {suggestions.length > 0 && (
              <ul className="bg-white border rounded mt-1 max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear Código Postal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
