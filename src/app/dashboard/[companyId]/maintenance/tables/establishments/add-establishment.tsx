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
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";

type AddEstablishmentProps = { companyId: string };
export default function AddEstablishment(props: AddEstablishmentProps) {
  const { mutateAsync: createEstablishment, isLoading } =
    api.establishments.create.useMutation();
  const [brand, setBrand] = useState("");
  const [establishmentNumber, setEstablishmentNumber] = useState("");
  const [flag, setFlag] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: brands } = api.brands.getbyCompany.useQuery({
    companyId: props.companyId,
  });

  const selectBrandOptions = brands?.map((brand) => (
    <SelectItem key={brand!.id} value={brand!.id}>
      {brand!.name}
    </SelectItem>
  ));
  const flags = [
    { id: "1", name: "Visa" },
    { id: "2", name: "MasterCard" },
  ];

  const selectFlagOptions = flags?.map((flag) => (
    <SelectItem key={flag.id} value={flag.name}>
      {flag.name}
    </SelectItem>
  ));
  async function handleCreate() {
    try {
      await createEstablishment({
        flag: flag,
        brandId: brand,
        establishment_number: establishmentNumber,
      });
      toast.success("Establecimiento creado correctamente");
      router.refresh();
      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" />
        Agregar Establecimiento
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Establecimiento</DialogTitle>
          </DialogHeader>
          <Label>Bandera</Label>
          <Select onValueChange={(value) => setFlag(value)}>
            <SelectTrigger>
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>{selectFlagOptions}</SelectContent>
          </Select>
          <Label>Marca</Label>
          <Select
            onValueChange={(value) => {
              setBrand(value);
            }}
          >
            <SelectTrigger>
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>{selectBrandOptions}</SelectContent>
          </Select>
          <Label>Número de Establecimiento</Label>
          <Input
            value={establishmentNumber}
            onChange={(e) => setEstablishmentNumber(e.target.value)}
            placeholder="Número de Establecimiento"
          />

          <DialogFooter>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading && <Loader2Icon />}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
