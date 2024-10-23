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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export function AddPostalCode() {
  const { mutateAsync: createPostalCode, isLoading } =
    api.postal_code.create.useMutation();
  // const { data:zonas} = api.zone.list.useQuery();
  const { data: zones } = api.zone.list.useQuery();

  const [name, setName] = useState("");
  const [cp, setCp] = useState("");

  const [zone, setZone] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  function validateFields() {
    const errors: string[] = [];
    if (!cp) errors.push("Código postal");
    if (!name) errors.push("Nombre");
    if (!zone) errors.push("Zona");

    return errors;
  }

  async function handleCreate() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos vacíos son obligatorios: ${validationErrors.join(
          ", "
        )}`
      );
    }

    try {
      await createPostalCode({
        cp: cp,
        name: name,
        zone: zone,
      });

      router.refresh();
      toast.success("Código postal creado exitosamente");
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

  function handleZoneChange(e: string) {
    setZone(e);
  }

  // function handleSuggestionClick(suggestion: string) {
  //   setZone(suggestion);
  //   setSuggestions([]);
  // }

  return (
    <>
      <Button onClick={() => setOpen(true)}
      className="rounded-full gap-1 px-4 py-5 text-base text-[#3E3E3E] bg-[#BEF0BB] hover:bg-[#DEF5DD]">
       {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-5 mr-1 stroke-1" />
                )}  
        Agregar código postal
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear código postal</DialogTitle>
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
            <Label htmlFor="cp">Código postal</Label>
            <Input
              id="cp"
              type="number"
              placeholder="0"
              value={cp}
              onChange={(e) => setCp(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="zone">Zona</Label>
            <Select value={zone} onValueChange={(e) => handleZoneChange(e)}>
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
            {/* <Input
              id="zone"
              type="text"
              placeholder="..."
              value={zone}
              onChange={handleZoneChange}
            /> */}
            {/* {suggestions.length > 0 && (
              <ul className="bg-white border rounded mt-1 max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )} */}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button  className="flex rounded-full w-fit justify-self-center bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#DEF5DD]"
                disabled={isLoading}
                onClick={handleCreate}>
                {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-4 mr-1 stroke-1" />
                )}
              Crear código postal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
