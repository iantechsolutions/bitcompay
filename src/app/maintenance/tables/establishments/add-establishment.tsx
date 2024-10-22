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
  const { data: establisments } = api.establishments.list.useQuery();

  const [brand, setBrand] = useState("");
  const [establishmentNumber, setEstablishmentNumber] = useState("");
  const [flag, setFlag] = useState("");
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({
    brand: "",
    establishmentNumber: "",
    flag: "",
  });

  const router = useRouter();
  const { data: brands } = api.brands.list.useQuery();

  const selectBrandOptions = brands?.map((brand) => (
    <SelectItem key={brand!.id} value={brand!.id}>
      {brand!.name}
    </SelectItem>
  ));
  const flags = [
    { id: "1", name: "VISA" },
    { id: "2", name: "MASTERCARD" },
  ];

  const selectFlagOptions = flags?.map((flag) => (
    <SelectItem key={flag.id} value={flag.name}>
      {flag.name}
    </SelectItem>
  ));

  async function handleCreate() {
    let hasErrors = false;
    const newErrors = { brand: "", establishmentNumber: "", flag: "" };

    if (!flag) {
      newErrors.flag = "Debe seleccionar una bandera.";
      hasErrors = true;
    }
    if (!brand) {
      newErrors.brand = "Debe seleccionar una marca.";
      hasErrors = true;
    }
    if (
      !establishmentNumber ||
      establisments?.some(
        (x) => x.establishment_number === parseInt(establishmentNumber)
      )
    ) {
      newErrors.establishmentNumber =
        "Debe ingresar el número de establecimiento nuevo.";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

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
      <Button onClick={() => setOpen(true)}
        className="rounded-full gap-1 px-4 py-5 text-base text-[#3E3E3E] bg-[#BEF0BB] hover:bg-[#DEF5DD]">
        {isLoading ? (
                   <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                 ) : (
                   <PlusCircleIcon className="h-5 mr-1 stroke-1" />
                 )}    
      Agregar Establecimiento
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Establecimiento</DialogTitle>
          </DialogHeader>

          <div className="mb-4">
            <Label>Bandera</Label>
            <Select onValueChange={(value) => setFlag(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una bandera" />
              </SelectTrigger>
              <SelectContent>{selectFlagOptions}</SelectContent>
            </Select>
            {errors.flag && <p className="text-red-500">{errors.flag}</p>}
          </div>

          <div className="mb-4">
            <Label>Marca</Label>
            <Select
              onValueChange={(value) => {
                setBrand(value);
              }}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una marca" />
              </SelectTrigger>
              <SelectContent>{selectBrandOptions}</SelectContent>
            </Select>
            {errors.brand && <p className="text-red-500">{errors.brand}</p>}
          </div>

          <div className="mb-4">
            <Label>Número de Establecimiento</Label>
            <Input
              value={establishmentNumber}
              onChange={(e) => setEstablishmentNumber(e.target.value)}
              placeholder="0"
            />
            {errors.establishmentNumber && (
              <p className="text-red-500">{errors.establishmentNumber}</p>
            )}
          </div>

          <DialogFooter className="sm:justify-center">
            <Button className="flex rounded-full w-fit justify-self-center bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#DEF5DD]"
                disabled={isLoading}
                onClick={handleCreate}>
                {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-4 mr-1 stroke-1" />
                )}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
