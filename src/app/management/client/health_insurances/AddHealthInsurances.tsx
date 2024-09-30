"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { CirclePlus, Loader2Icon, PlusCircleIcon } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import Calendar01Icon from "~/components/icons/calendar-01-stroke-rounded";
import { Calendar } from "~/components/ui/calendar";
import { bussinessUnits } from "~/server/db/schema";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";

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
  const { data: cps } = api.postal_code.list.useQuery();
  const { data: businessUnits } = api.bussinessUnits.list.useQuery();
  // const { data: company } = api.companies.get.useQuery();
  // State management for the form fields
  // const [name, setName] = useState(OS?.name ?? "");
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
  const [initials, setInitials] = useState(OS?.initials ?? "");
  const [businessUnit, setBusinessUnit] = useState(OS?.businessUnit ?? "");
  const [businessName, setBusinessName] = useState(OS?.businessName ?? "");
  const [fiscalAddress, setFiscalAddress] = useState(OS?.fiscalAddress ?? "");
  const [fiscalFloor, setFiscalFloor] = useState(OS?.fiscalFloor ?? "");
  const [fiscalOffice, setFiscalOffice] = useState(OS?.fiscalOffice ?? "");
  const [fiscalLocality, setFiscalLocality] = useState(
    OS?.fiscalLocality ?? ""
  );
  const [fiscalProvince, setFiscalProvince] = useState(
    OS?.fiscalProvince ?? ""
  );
  const [fiscalPostalCode, setFiscalPostalCode] = useState(
    OS?.fiscalPostalCode ?? ""
  );
  const [fiscalCountry, setFiscalCountry] = useState(OS?.fiscalCountry ?? "");
  const [IIBBStatus, setIIBBStatus] = useState(OS?.IIBBStatus ?? "");
  const [IIBBNumber, setIIBBNumber] = useState(OS?.IIBBNumber ?? "");
  const [sellCondition, setSellCondition] = useState(OS?.sellCondition ?? "");
  const [phoneNumber, setPhoneNumber] = useState(OS?.phoneNumber ?? "");
  const [email, setEmail] = useState(OS?.email ?? "");
  const [state, setState] = useState(OS?.state ?? "");
  const [user, setUser] = useState(OS?.user ?? "");
  const [cancelMotive, setCancelMotive] = useState(OS?.cancelMotive ?? "");
  const [floor, setFloor] = useState(OS?.floor ?? "");
  const [office, setOffice] = useState(OS?.office ?? "");
  const [dateState, setDateState] = useState<Date | undefined>(
    OS?.dateState ?? undefined
  );
  const [popoverEmisionOpen, setPopoverEmisionOpen] = useState(false);

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function validateFields() {
    const errors: string[] = [];
    if (!businessName) errors.push("RAZON SOCIAL");
    if (!idNumber) errors.push("CODIGO");
    // if (!fiscalIdNumber) errors.push("NRO DOC. FISCAL");
    if (!fiscalIdType) errors.push("TIPO DOC FISCAL");
    if (!afipStatus) errors.push("ESTADO AFIP");
    // if (!responsibleName) errors.push("Nombre de facturacion");
    // if (!code) errors.push("Código");
    // if (!billType) errors.push("Tipo de Factura");

    return errors;
  }
  async function handleCreate() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
      return;
    }

    try {
      // Creating a health insurance product
      const healthInsurance = await createHealtinsurances({
        name: businessName,
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
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
      return;
    }
    try {
      // Creating a health insurance product
      const healthInsurance = await UploadhealthInsurances({
        healthInsuranceId: OS?.id ?? "",
        name: businessName,
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
  let cN = "";
  OS
    ? (cN =
        "text-sm px-4 py-2 h-5 justify-center place-content-center rounded-full font-[550] text-[#3E3E3E]")
    : (cN = "rounded-full gap-1 p-4 text-base text-[#3E3E3E] bg-[#BEF0BB] ");

  return (
    <>
      <AddElementButton onClick={() => setOpen(true)} className={cN}>
        {OS ? (
          <>
            <Edit02Icon className="h-3" />
            Editar
          </>
        ) : (
          <>
            <PlusCircleIcon className="h-4" />
            Agregar obra social como cliente
          </>
        )}
      </AddElementButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[1000px] max-h-[95vh] gap-4 rounded-2xl p-6 overflow-y-scroll">
          <DialogHeader>
            {OS ? (
              <DialogTitle>Editar obra social</DialogTitle>
            ) : (
              <DialogTitle>Agregar obra social</DialogTitle>
            )}
          </DialogHeader>
          <div className="grid grid-cols-4 gap-y-4 gap-x-8 justify-between">
            <div>
              <Label htmlFor="IdNumber" className="text-xs text-gray-500">
                CODIGO
              </Label>
              <Input
                id="code"
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder=""
              />

              {/* <Select onValueChange={setIdNumber}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none ">
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1-3432-8</SelectItem>
                  <SelectItem value="2">1-3456-2</SelectItem>
                  <SelectItem value="3">1-3567-1</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
            <div>
              <Label className="text-xs text-gray-500">SIGLA</Label>
              <Input
                id="importe"
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder=""
              />
              {/* <Select>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none ">
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">OSBARA</SelectItem>
                  <SelectItem value="2">OSECAC</SelectItem>
                  <SelectItem value="3">UTHGRA</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
            <div />
            <div />

            <p className="col-span-4 mt-3 p-3 justify-start text-black font-xs text-sm font-semibold">
              Datos fiscales
            </p>
            <div>
              <Label className="text-xs text-gray-500">UNIDAD DE NEGOCIO</Label>
              {/* <Input
                type="number"
                id="importe"
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder="Ej: 121234"
              /> */}
              <Select
                onValueChange={setBusinessUnit}
                value={businessUnit}
                >
                <SelectTrigger
                  className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right">
                  <SelectValue placeholder="Seleccione una UN" />
                </SelectTrigger>
                <SelectContent>
                  {businessUnits?.map((bu) => (
                    <SelectItem key={bu.id} value={bu.id}>
                      {bu?.description ?? ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name" className="text-xs text-gray-500">
                RAZON SOCIAL
              </Label>
              <Input
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="name"
                placeholder="..."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">CUIT</Label>
              <Input
                type="number"
                id="importe"
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder="XX-XXXXXXXX-X"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">CONDICIÓN AFIP</Label>
              <Select onValueChange={setAfipStatus} value={afipStatus}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione uno" />
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
              <Label className="text-xs text-gray-500">CONDICIÓN IIBB</Label>
              <Select onValueChange={setIIBBStatus} value={IIBBStatus}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione uno" />
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
              <Label htmlFor="IdNumber" className="text-xs text-gray-500">
                N° IIBB
              </Label>
              <Input
                id="IdNumber"
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
                placeholder="..."
                value={IIBBNumber}
                onChange={(e) => setIIBBNumber(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="IdNumber" className="text-xs text-gray-500">
                CONDICION DE VENTA
              </Label>
              <Input
                id="IdNumber"
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
                placeholder="..."
                value={sellCondition}
                onChange={(e) => setSellCondition(e.target.value)}
              />
            </div>
            <div></div>
            <div className="w-">
              <Label htmlFor="address" className="text-xs text-gray-500">
                DOMICILIO FISCAL
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={fiscalAddress}
                onChange={(e) => setFiscalAddress(e.target.value)}
              />
            </div>
            <div className="flex-auto w-24">
              <Label htmlFor="address" className="text-xs text-gray-500">
                PISO
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={fiscalFloor}
                onChange={(e) => setFiscalFloor(e.target.value)}
              />
            </div>
            <div className="flex-auto w-24">
              <Label htmlFor="address" className="text-xs text-gray-500">
                OFICINA
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={fiscalOffice}
                onChange={(e) => setFiscalOffice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                LOCALIDAD
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={fiscalLocality}
                onChange={(e) => setFiscalLocality(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                PROVINCIA
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={fiscalProvince}
                onChange={(e) => setFiscalProvince(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postal_code" className="text-xs text-gray-500">
                CÓDIGO POSTAL
              </Label>
              <Select
                onValueChange={setFiscalPostalCode}
                value={fiscalPostalCode}>
                <SelectTrigger
                  className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full">
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
              <Label htmlFor="address" className="text-xs text-gray-500">
                PAÍS
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={fiscalCountry}
                onChange={(e) => setFiscalCountry(e.target.value)}
              />
            </div>

            <p className="col-span-4 mt-3 p-3 justify-start text-black font-xs text-sm font-semibold">
              Datos de Contacto
            </p>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                DOMICILIO COMERCIAL
              </Label>
              <Input
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="address"
                placeholder="..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                PISO
              </Label>
              <Input
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="address"
                placeholder="..."
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                OFICINA
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={office}
                onChange={(e) => setOffice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="locality" className="text-xs text-gray-500">
                LOCALIDAD
              </Label>
              <Input
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="locality"
                placeholder="..."
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="province" className="text-xs text-gray-500">
                PROVINCIA
              </Label>
              <Input
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="province"
                placeholder="..."
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postal_code" className="text-xs text-gray-500">
                CÓDIGO POSTAL
              </Label>
              <Select onValueChange={setPostalCode} value={postalCode}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none ">
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
              <Label htmlFor="address" className="text-xs text-gray-500">
                TELÉFONO
              </Label>
              <Input
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="address"
                placeholder="..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                E-MAIL
              </Label>
              <Input
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="address"
                placeholder="..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p className="col-span-4 mt-3 p-3 justify-start text-black font-xs text-sm font-semibold">
              Información de la cuenta
            </p>
            <div>
              <Label htmlFor="postal_code" className="text-xs text-gray-500">
                ESTADO
              </Label>
              <Select onValueChange={setState} value={state}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none ">
                  <SelectValue placeholder="Seleccionar CP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                  <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                  <SelectItem value="BAJA">BAJA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postal_code" className="text-xs text-gray-500">
                FECHA DE ESTADO
              </Label>
              <Popover>
                <PopoverTrigger asChild={true}>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "text-left flex justify-between font-medium w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none pr-0 pl-0",
                      !dateState && "text-muted-foreground"
                    )}>
                    {dateState ? (
                      format(dateState, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                    <Calendar01Icon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className=" p-0 overflow-y-scroll">
                  <Calendar
                    mode="single"
                    selected={dateState}
                    onSelect={(e) => setDateState(e)}
                    initialFocus={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="user" className="text-xs text-gray-500">
                USUARIO
              </Label>
              <Input
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="user"
                placeholder="..."
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cancelMotive" className="text-xs text-gray-500">
                MOTIVO DE BAJA
              </Label>
              <Input
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="cancelMotive"
                placeholder="..."
                value={cancelMotive}
                onChange={(e) => setCancelMotive(e.target.value)}
              />
            </div>

            {/* {OS ? null : (
              <div>
                <Label htmlFor="initialValue">Saldo inicial</Label>
                <Input
                  id="initialValue"
                  placeholder="..."
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                />
              </div>
            )} */}
            <div className="flex items-center justify-center">
              {error && (
                <span className="text-red-600 text-xs text-center">
                  {error}
                </span>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-self-start">
            {OS ? (
              <Button
                disabled={isPending}
                onClick={handleEdit}
                className="mt-7 font-medium mb-2 rounded-full w-fit bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3E3E3E] flex items-center justify-start justify-left">
                {isPending ? (
                  <Loader2Icon className="mr-2 animate-spin" size={20} />
                ) : (
                  <>
                    <Edit02Icon className="mr-2 h-4" />
                    Actualizar
                  </>
                )}
              </Button>
            ) : (
              <Button
                disabled={isLoading}
                onClick={handleCreate}
                className="mt-7 font-medium mb-2 rounded-full w-fit bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3E3E3E] flex items-center self-start">
                {isLoading ? (
                  <Loader2Icon className="mr-2 animate-spin" size={20} />
                ) : (
                  <>
                    <CirclePlus className="mr-2" size={20} />
                    Alta de obra social
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
