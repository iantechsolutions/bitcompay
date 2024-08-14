"use client";

import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

export function AddZones() {
  const { mutateAsync: createZone, isLoading } = api.zone.create.useMutation();
  const { data: postal_code } = api.postal_code.list.useQuery();

  const [name, setName] = useState("");
  const [cp, setCp] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  async function handleCreate() {
    if (!postal_code?.some((code) => code.cp === cp)) {
      toast.error("El código postal no es válido");
      return;
    }

    try {
      await createZone({
        name: name,
        cp: cp,
      });

      toast.success("Zona creada exitosamente");
      router.refresh();
      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  function handleCpChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCp(value);

    if (value) {
      const filteredSuggestions =
        postal_code
          ?.filter((code) => code.cp.toString().startsWith(value))
          .map((code) => code.cp.toString()) || [];
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setCp(suggestion);
    setSuggestions([]);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Agregar zona
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Zona</DialogTitle>
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
            <Label htmlFor="cp">Código Postal</Label>
            <Input
              id="cp"
              type="text"
              placeholder="..."
              value={cp}
              onChange={handleCpChange}
            />
            {suggestions.length > 0 && (
              <ul className="bg-white border rounded mt-1">
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
              Crear Zona
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
