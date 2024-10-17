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
import { es } from "date-fns/locale";
import { setDefaultOptions } from "date-fns";

export function AddHealthInsurances(props: {
  healthInsurance: RouterOutputs["healthInsurances"]["get"] | null;
}) {
  setDefaultOptions({ locale: es });
  const OS = props?.healthInsurance;

  // const { data: OS } = api.healthInsurances.get.useQuery({
  //   healthInsuranceId: OSId ?? "",
  // });
  // const { mutateAsync: startCC } =
  //   api.currentAccount.createInitial.useMutation();
  const { mutateAsync: createHealtinsurances, isLoading } =
    api.healthInsurances.create.useMutation();

  const { mutateAsync: UploadhealthInsurances, isLoading: isPending } =
    api.healthInsurances.change.useMutation();

  const { data: cps } = api.postal_code.list.useQuery();
  const { data: businessUnits } = api.bussinessUnits.list.useQuery();
  // const { data: company } = api.companies.get.useQuery();
  // State management for the form fields
  // const [name, setName] = useState(OS?.name ?? "");
  const [identificationNumber, setIdentificationNumber] = useState(
    OS?.identificationNumber ?? ""
  );
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

  const [locality, setLocality] = useState(OS?.locality ?? "");
  const [province, setProvince] = useState(OS?.province ?? "");
  const [postalCode, setPostalCode] = useState(OS?.postal_code ?? "");
  const [initials, setInitials] = useState(OS?.initials ?? "");
  const [businessUnit, setBusinessUnit] = useState(OS?.businessUnit ?? "");
  const [razonsocial, setRazonsocial] = useState(OS?.businessName ?? "");
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
  const [description, setDescripcion] = useState(OS?.description ?? "");

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
  const [initialValue, setInitialValue] = useState("0");
  // const [isClient, setIsClient] = useState(OS?.isClient ?? false);

  const [dateState, setDateState] = useState<Date | undefined>(
    OS?.dateState ?? undefined
  );
  const [excelDocument, setExcelDocument] = useState(OS?.excelDocument ?? "");
  const [excelAmount, setExcelAmount] = useState(OS?.excelAmount ?? "");
  const [excelEmployerDocument, setExcelEmployerDocument] = useState(
    OS?.excelDocument ?? ""
  );
  const [excelSupportPeriod, setExcelSupportPeriod] = useState(
    OS?.excelSupportPeriod ?? ""
  );

  const [excelContributionperiod, setExcelContributionperiod] = useState(
    OS?.excelContributionperiod ?? undefined
  );

  // excelDocument: varchar("excelDocument", { length: 255 }),
  // excelAmount: varchar("excelAmount"),
  // excelEmployerDocument: varchar("excelEmployerDocument", { length: 255 }),
  // excelSupportPeriod: timestamp("excelSupportPeriod", {
  //   mode: "date",
  // }),
  // excelContributionperiod: timestamp("excelContributionperiod", {
  //   mode: "date",
  // }),

  const [popoverEmisionOpen, setPopoverEmisionOpen] = useState(false);

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [openCalendar, setOpenCalendar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [responsibleName, setResponsibleName] = useState(
    OS?.responsibleName ?? ""
  );

  function validateFields() {
    const errors: string[] = [];
    if (!razonsocial) errors.push("RAZÓN SOCIAL");
    if (!identificationNumber) errors.push("CÓDIGO");
    if (!fiscalIdType) errors.push("TIPO DOC FISCAL");
    if (!afipStatus) errors.push("ESTADO AFIP");
    if (!description) errors.push("DESCRIPCIÓN");

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
        identificationNumber: identificationNumber,
        initials: initials,
        name: razonsocial,
        description: description,
        businessUnit: businessUnit,
        businessName: razonsocial,
        fiscal_id_number: fiscalIdNumber.toString(),
        afip_status: afipStatus,
        IIBBStatus: IIBBStatus,
        IIBBNumber: IIBBNumber,
        sellCondition: sellCondition,
        fiscalAddress: fiscalAddress,
        fiscalFloor: fiscalFloor,
        fiscalOffice: fiscalOffice,
        fiscalLocality: fiscalLocality,
        fiscalProvince: fiscalProvince,
        fiscalPostalCode: fiscalPostalCode,
        fiscalCountry: fiscalCountry,

        adress: address,
        floor: floor,
        office: office,
        locality: locality,
        province: province,
        postal_code: postalCode,
        initialValue: initialValue,

        phoneNumber: phoneNumber,
        email: email,
        state: state,
        user: user,
        cancelMotive: cancelMotive,

        isClient: true,
        dateState: dateState,
        responsibleName: responsibleName,

        excelDocument: excelDocument,
        excelAmount: excelAmount,
        excelEmployerDocument: excelEmployerDocument,
        excelSupportPeriod: excelSupportPeriod,
        excelContributionperiod: excelContributionperiod,
        // origen: origen,

        // initialValue: initialValue,
        // responsibleName: responsibleName,
        // sellCondition: sellCondition,
        // user: user,
        // cancelMotive: cancelMotive,
        // fiscal_id_type: fiscalIdType,
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
        id: OS?.id ?? "",
        identificationNumber: identificationNumber,
        initials: initials,
        name: razonsocial,
        description: description,

        businessUnit: businessUnit,
        businessName: razonsocial,
        fiscal_id_number: fiscalIdNumber.toString(),
        afip_status: afipStatus,
        IIBBStatus: IIBBStatus,
        IIBBNumber: IIBBNumber,
        sellCondition: sellCondition,
        fiscalAddress: fiscalAddress,
        fiscalFloor: fiscalFloor,
        fiscalOffice: fiscalOffice,
        fiscalLocality: fiscalLocality,
        fiscalProvince: fiscalProvince,
        fiscalPostalCode: fiscalPostalCode,
        fiscalCountry: fiscalCountry,

        adress: address,
        floor: floor,
        office: office,
        locality: locality,
        province: province,
        postal_code: postalCode,
        phoneNumber: phoneNumber,
        email: email,

        isClient: true,
        state: state,
        dateState: dateState,
        responsibleName: user,
        cancelMotive: cancelMotive,

        excelDocument: excelDocument,
        excelAmount: excelAmount,
        excelEmployerDocument: excelEmployerDocument,
        excelSupportPeriod: excelSupportPeriod,
        excelContributionperiod: excelContributionperiod,
        // origen: origen,
        // initialValue: initialValue,
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
        <DialogContent className="max-w-[1000px] max-h-[95vh] gap-4 rounded-2xl py-8 px-14 overflow-y-scroll">
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
                CÓDIGO
              </Label>
              <Input
                id="code"
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder="0"
                value={identificationNumber}
                onChange={(e) => setIdentificationNumber(e.target.value)}
              />

              {/* <Select onValueChange={setIdentificationNumber}>
                <SelectTrigger className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none ">
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
                id="initials"
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder=""
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Descripción</Label>
              <Input
                id="description"
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder=""
                value={description}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div>
              {/* <Label className="text-xs text-gray-500">Es cliente?</Label>
              <Select
                onValueChange={(value) => setIsClient(value === "true")}
                value={isClient !== null ? String(isClient) : undefined}>
                <SelectTrigger
                  className="w-fit mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Es cliente</SelectItem>
                  <SelectItem value="false">No es cliente</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
            <div />
            <div />

            <p className="col-span-4 mt-3 px-1 py-2 justify-start text-black font-xs text-sm font-semibold">
              Datos fiscales
            </p>
            <div>
              <Label className="text-xs text-gray-500">UNIDAD DE NEGOCIO</Label>
              <Select onValueChange={setBusinessUnit} value={businessUnit}>
                <SelectTrigger
                  className="w-fit mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
                RAZÓN SOCIAL
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="name"
                placeholder="..."
                value={razonsocial}
                onChange={(e) => setRazonsocial(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs text-gray-500">CUIT</Label>
              <Input
                type="number"
                id="importe"
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder="XX-XXXXXXXX-X"
                value={fiscalIdNumber}
                onChange={(e) => setFiscalIdNumber(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">CONDICIÓN AFIP</Label>
              <Select onValueChange={setAfipStatus} value={afipStatus}>
                <SelectTrigger className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione uno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monotributista">Monotributista</SelectItem>
                  <SelectItem value="responsable_inscripto">
                    Responsable inscripto
                  </SelectItem>
                  <SelectItem value="exento">Exento</SelectItem>
                  <SelectItem value="consumidor_final">
                    Consumidor final
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500">CONDICIÓN IIBB</Label>
              <Select onValueChange={setIIBBStatus} value={IIBBStatus}>
                <SelectTrigger className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione uno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monotributista">Monotributista</SelectItem>
                  <SelectItem value="responsable_inscripto">
                    Responsable inscripto
                  </SelectItem>
                  <SelectItem value="exento">Exento</SelectItem>
                  <SelectItem value="consumidor_final">
                    Consumidor final
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
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none"
                placeholder="0"
                value={IIBBNumber}
                onChange={(e) => setIIBBNumber(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="IdNumber" className="text-xs text-gray-500">
                CONDICIÓN DE VENTA
              </Label>
              <Input
                id="IdNumber"
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none"
                placeholder="0"
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
                className=" mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
                className=" mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="0"
                value={fiscalFloor}
                onChange={(e) => setFiscalFloor(e.target.value)}
              />
            </div>
            <div className="flex-auto w-24">
              <Label htmlFor="address" className="text-xs text-gray-500">
                OFICINA
              </Label>
              <Input
                className=" mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="0"
                value={fiscalOffice}
                onChange={(e) => setFiscalOffice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                LOCALIDAD
              </Label>
              <Input
                className=" mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
                className=" mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
                  className=" mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full">
                  <SelectValue placeholder="0" />
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
                className=" mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={fiscalCountry}
                onChange={(e) => setFiscalCountry(e.target.value)}
              />
            </div>
            <p className="col-span-4 mt-3 px-1 py-2 justify-start text-black font-xs text-sm font-semibold">
              Información de la cuenta
            </p>
            <div>
              <Label htmlFor="state" className="text-xs text-gray-500">
                ESTADO
              </Label>
              <Select onValueChange={setState} value={state}>
                <SelectTrigger className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none ">
                  <SelectValue placeholder="Seleccionar estado" />
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
              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                <PopoverTrigger asChild={true} autoFocus={false}>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "text-left flex justify-between font-medium w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none pr-0 pl-0",
                      !dateState && "text-muted-foreground"
                    )}
                    onClick={() => setOpenCalendar(!openCalendar)} // Controla la apertura
                  >
                    {dateState ? (
                      format(dateState, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                    <Calendar01Icon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-0">
                  <Calendar
                    mode="single"
                    selected={dateState}
                    onSelect={(date) => {
                      setDateState(date); // Asigna la fecha seleccionada
                      setOpenCalendar(false); // Cierra el Popover automáticamente
                    }}
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
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
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
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="cancelMotive"
                placeholder="..."
                value={cancelMotive}
                onChange={(e) => setCancelMotive(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="user" className="text-xs text-gray-500">
                NOMBRE DEL RESPONSABLE
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="user"
                placeholder="..."
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
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
            <p className="col-span-4 mt-3 px-1 py-2 justify-start text-black font-xs text-sm font-semibold">
              Datos de Contacto
            </p>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                DOMICILIO COMERCIAL
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
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
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="address"
                placeholder="0"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                OFICINA
              </Label>
              <Input
                className=" mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="0"
                value={office}
                onChange={(e) => setOffice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="locality" className="text-xs text-gray-500">
                LOCALIDAD
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
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
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
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
                <SelectTrigger className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none ">
                  <SelectValue placeholder="0" />
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
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="address"
                placeholder="0"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs text-gray-500">
                E-MAIL
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="address"
                placeholder="..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <p className="col-span-4 mt-3 px-1 py-2 justify-start text-black font-xs text-sm font-semibold">
              Asignar columnas de excel
            </p>
            <div>
              <Label htmlFor="excelDocument" className="text-xs text-gray-500">
                CUIL
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="excelDocument"
                placeholder="..."
                value={excelDocument}
                onChange={(e) => setExcelDocument(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postal_code" className="text-xs text-gray-500">
                Monto
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="excelAmount"
                placeholder="..."
                value={excelAmount}
                onChange={(e) => setExcelAmount(e.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor="excelEmployerDocument"
                className="text-xs text-gray-500">
                CUIT EMPRESA
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="excelEmployerDocument"
                placeholder="..."
                value={excelEmployerDocument}
                onChange={(e) => setExcelEmployerDocument(e.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor="excelContributionperiod"
                className="text-xs text-gray-500">
                Periodo de pago
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="excelContributionperiod"
                placeholder="..."
                value={excelContributionperiod}
                onChange={(e) => setExcelContributionperiod(e.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor="excelSupportPeriod"
                className="text-xs text-gray-500">
                Periodo de soporte
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="excelSupportPeriod"
                placeholder="..."
                value={excelSupportPeriod}
                onChange={(e) => setExcelSupportPeriod(e.target.value)}
              />
            </div>
            {/* <div>
              <Label htmlFor="type" className="text-xs text-gray-500">
                Tipo
              </Label>
              <Input
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                id="type"
                placeholder="..."
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div> */}
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
