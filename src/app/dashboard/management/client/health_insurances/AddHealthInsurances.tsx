"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
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
import AddElementButton from "~/components/add-element";

export function AddHealthInsurances() {
  const { mutateAsync: createHealtinsurances, isLoading } =
    api.healthInsurances.create.useMutation();
  const { mutateAsync: startCC } =
    api.currentAccount.createInitial.useMutation();
  const { data: company } = api.companies.get.useQuery();
  const { data: cps } = api.postal_code.list.useQuery();

  // State management for the form fields
  const [description, setDescription] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [afipStatus, setAfipStatus] = useState("monotributista");
  const [fiscalIdNumber, setFiscalIdNumber] = useState("");
  const [fiscalIdType, setFiscalIdType] = useState("CUIT");
  const [responsibleName, setResponsibleName] = useState("");
  const [locality, setLocality] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [initialValue, setInitialValue] = useState("0");

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    try {
      if (
        !description ||
        !idNumber ||
        !afipStatus ||
        !fiscalIdNumber ||
        !fiscalIdType ||
        !responsibleName ||
        !company
      ) {
        setError("Todos los campos son obligatorios.");
        return;
      }

      // Creating a health insurance product
      const healthInsurance = await createHealtinsurances({
        name: description,
        identificationNumber: idNumber,
        isClient: true,
        adress: address,
        afip_status: afipStatus,
        fiscal_id_number: fiscalIdNumber,
        fiscal_id_type: fiscalIdType,
        responsibleName: responsibleName,
        locality: locality,
        province: province,
        postal_code: postalCode,
        initialValue: initialValue,
      });

      toast.success("Obra social creada correctamente");
      queryClient.invalidateQueries(["healthInsurances"]); // Specify the key to invalidate

      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <>
      <AddElementButton onClick={() => setOpen(true)}>
        Agregar Obra social como cliente
      </AddElementButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Agregar obra social</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <Label htmlFor="IdNumber">Numero de Identificacion</Label>
              <Input
                id="IdNumber"
                placeholder="..."
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Nombre</Label>
              <Input
                id="description"
                placeholder="..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="facturationName">Nombre de facturacion</Label>
              <Input
                id="facturationName"
                placeholder="..."
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
              />
            </div>
            <div>
              <Label>Seleccione tipo de documento fiscal</Label>
              <Select onValueChange={setFiscalIdType} value={fiscalIdType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo de ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUIT">CUIT</SelectItem>
                  <SelectItem value="CUIL">CUIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idNumber">Numero de documento fiscal</Label>
              <Input
                id="idNumber"
                placeholder="..."
                value={fiscalIdNumber}
                onChange={(e) => setFiscalIdNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address">Direccion de facturacion</Label>
              <Input
                id="address"
                placeholder="..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="locality">Localidad</Label>
              <Input
                id="locality"
                placeholder="..."
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                placeholder="..."
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Codigo Postal</Label>
              <Select onValueChange={setPostalCode} value={postalCode}>
                <SelectTrigger className="w-[180px] font-bold">
                  <SelectValue placeholder="Seleccionar CP" />
                </SelectTrigger>
                <SelectContent>
                  {cps?.map((cp) => (
                    <SelectItem key={cp.id} value={cp.id}>
                      {cp.cp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado de AFIP</Label>
              <Select onValueChange={setAfipStatus} value={afipStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado de AFIP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monotributista">Monotributista</SelectItem>
                  <SelectItem value="responsable_inscripto">
                    Responsable Inscripto
                  </SelectItem>
                  <SelectItem value="exento">Exento</SelectItem>
                  <SelectItem value="consumidor_final">
                    Consumidor Final
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="initialValue">Saldo inicial</Label>
              <Input
                id="initialValue"
                placeholder="..."
                value={initialValue}
                onChange={(e) => setInitialValue(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-center">
              {error && (
                <span className="text-red-600 text-xs text-center">
                  {error}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading ? (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
