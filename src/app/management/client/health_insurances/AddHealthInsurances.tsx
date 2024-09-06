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
import { router } from "@trpc/server";
import { RouterOutputs } from "~/trpc/shared";

export function AddHealthInsurances(props: {
  healthInsurance: RouterOutputs["healthInsurances"]["get"] | null;
}) {
  const OS = props?.healthInsurance;

  // const { data: OS } = api.healthInsurances.get.useQuery({
  //   healthInsuranceId: OSId ?? "",
  // });
  const { mutateAsync: createHealtinsurances, isLoading } =
    api.healthInsurances.create.useMutation();

  const { mutateAsync: UploadhealthInsurances, isLoading: isPending } =
    api.healthInsurances.change.useMutation();
  const { mutateAsync: startCC } =
    api.currentAccount.createInitial.useMutation();
  const { data: company } = api.companies.get.useQuery();
  const { data: cps } = api.postal_code.list.useQuery();

  // State management for the form fields
  const [name, setName] = useState(OS?.name ?? "");
  const [idNumber, setIdNumber] = useState(OS?.identificationNumber ?? "");
  const [address, setAddress] = useState(OS?.adress ?? "");
  const [afipStatus, setAfipStatus] = useState(
    OS?.afip_status ?? "monotributista"
  );
  const [fiscalIdNumber, setFiscalIdNumber] = useState(
    OS?.fiscal_id_number ?? 0
  );
  const [fiscalIdType, setFiscalIdType] = useState(
    OS?.fiscal_id_number ?? "CUIT"
  );
  const [responsibleName, setResponsibleName] = useState(
    OS?.responsibleName ?? ""
  );
  const [locality, setLocality] = useState(OS?.locality ?? "");
  const [province, setProvince] = useState(OS?.province ?? "");
  const [postalCode, setPostalCode] = useState(OS?.postal_code ?? "");
  const [initialValue, setInitialValue] = useState("0");

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  async function handleCreate() {
    try {
      if (
        !name ||
        !idNumber ||
        !afipStatus ||
        !fiscalIdNumber ||
        !fiscalIdType ||
        !responsibleName ||
        !company
      ) {
        setError("Todos los campos son obligatoriOS?.");
        return;
      }

      // Creating a health insurance product
      const healthInsurance = await createHealtinsurances({
        name: name,
        identificationNumber: idNumber,
        isClient: true,
        adress: address,
        afip_status: afipStatus,
        fiscal_id_number: fiscalIdNumber.toString(),
        fiscal_id_type: fiscalIdType,
        responsibleName: responsibleName,
        locality: locality,
        province: province,
        postal_code: postalCode,
        initialValue: initialValue,
      });

      toast.success("Obra social creada correctamente");
      router.refresh();
      queryClient.invalidateQueries();

      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  async function handleEdit() {
    try {
      if (
        !name ||
        !idNumber ||
        !afipStatus ||
        !fiscalIdNumber ||
        !fiscalIdType ||
        !responsibleName ||
        !company
      ) {
        setError("Todos los campos son obligatoriOS?.");
        return;
      }

      // Creating a health insurance product
      const healthInsurance = await UploadhealthInsurances({
        healthInsuranceId: OS?.id ?? "",
        name: name,
        identificationNumber: idNumber,
        adress: address,
        afip_status: afipStatus,
        fiscal_id_number: fiscalIdNumber.toString(),
        fiscal_id_type: fiscalIdType,
        responsibleName: responsibleName,
        locality: locality,
        province: province,
        postal_code: postalCode,
      });

      toast.success("Datos actualizados");
      router.refresh();

      queryClient.invalidateQueries();

      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <>
      <AddElementButton onClick={() => setOpen(true)}>
        {OS ? <>Editar datos</> : <>Agregar Obra social como cliente</>}
      </AddElementButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[850px]">
          <DialogHeader>
            {OS ? (
              <DialogTitle>Editar obra social</DialogTitle>
            ) : (
              <DialogTitle>Agregar obra social</DialogTitle>
            )}
          </DialogHeader>
          <div className="grid grid-cols-4 gap-y-4 gap-x-8">
            <div>
              <Label htmlFor="IdNumber" className="text-xs">
                CODIGO
              </Label>
              <Input
                id="IdNumber"
                className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                placeholder="..."
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="IdNumber" className="text-xs">
                SIGLA
              </Label>
              <Input
                id="IdNumber"
                className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                placeholder="..."
                value={idNumber}
                disabled={true}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>
            <div />
            <div />
            <p className="col-span-4">Datos fiscales</p>

            <div>
              <Label className="text-xs">UNIDAD DE NEGOCIO</Label>
              <Select
                onValueChange={setFiscalIdType}
                value={fiscalIdType}
                disabled={true}
              >
                <SelectTrigger
                  className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                >
                  <SelectValue placeholder="Seleccione un tipo de ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUIT">CUIT</SelectItem>
                  <SelectItem value="CUIL">CUIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name" className="text-xs">
                RAZON SOCIAL
              </Label>
              <Input
                disabled={true}
                className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                id="name"
                placeholder="..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">TIPO DOC. FISCAL</Label>
              <Select onValueChange={setFiscalIdType} value={fiscalIdType}>
                <SelectTrigger
                  className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                >
                  <SelectValue placeholder="Seleccione un tipo de ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUIT">CUIT</SelectItem>
                  <SelectItem value="CUIL">CUIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idNumber" className="text-xs">
                NRO DOC. FISCAL
              </Label>
              <Input
                className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
                hover:none justify-self-right"
                id="idNumber"
                placeholder="xxxxxxxxxxx"
                type="number"
                value={fiscalIdNumber}
                onChange={(e) => setFiscalIdNumber(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">CONDICIÓN AFIP</Label>
              <Select onValueChange={setAfipStatus} value={afipStatus}>
                <SelectTrigger
                  className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                >
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
              <Label className="text-xs">CONDICIÓN IIBB</Label>
              <Select
                onValueChange={setAfipStatus}
                value={afipStatus}
                disabled={true}
              >
                <SelectTrigger
                  className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                >
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
              <Label htmlFor="IdNumber" className="text-xs">
                N° IIBB
              </Label>
              <Input
                disabled={true}
                id="IdNumber"
                className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                placeholder="..."
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="IdNumber" className="text-xs">
                CONDICION DE VENTA
              </Label>
              <Input
                disabled={true}
                id="IdNumber"
                className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                placeholder="..."
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address" className="text-xs">
                DOMICILIO FISCAL
              </Label>
              <Input
                className=" mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div />
            <div />
            <p className="col-span-4">Datos de Contacto</p>
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
              <Label htmlFor="facturationName">Nombre de facturacion</Label>
              <Input
                id="facturationName"
                placeholder="..."
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
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

            {OS ? null : (
              <div>
                <Label htmlFor="initialValue">Saldo inicial</Label>
                <Input
                  id="initialValue"
                  placeholder="..."
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                />
              </div>
            )}
            <div className="flex items-center justify-center">
              {error && (
                <span className="text-red-600 text-xs text-center">
                  {error}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            {OS ? (
              <Button disabled={isPending} onClick={handleEdit}>
                {isPending ? (
                  <Loader2Icon className="mr-2 animate-spin" size={20} />
                ) : (
                  "Actualizar"
                )}
              </Button>
            ) : (
              <Button disabled={isLoading} onClick={handleCreate}>
                {isLoading ? (
                  <Loader2Icon className="mr-2 animate-spin" size={20} />
                ) : (
                  "Crear"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
