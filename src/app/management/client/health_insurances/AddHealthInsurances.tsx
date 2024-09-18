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
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import Calendar01Icon from "~/components/icons/calendar-01-stroke-rounded";
import { Calendar } from "~/components/ui/calendar";

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
  const { data: businessUnits } = api.bussinessUnits.list.useQuery();
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
  const [initials, setInitials] = useState(OS?.initials ?? "");
  const [businessUnit, setBusinessUnit] = useState(OS?.businessUnit ?? "");
  const [businessName, setBusinessName] = useState(OS?.businessName ?? "");
  const [fiscalAddress, setFiscalAddress] = useState(OS?.fiscalAddress ?? "");
  const [fiscalFloor, setFiscalFloor] = useState(OS?.fiscalFloor ?? "");
  const [fiscalOffice, setFiscalOffice] = useState(OS?.fiscalOffice ?? "");
  const [fiscalLocality, setFiscalLocality] = useState(OS?.fiscalLocality ?? "");
  const [fiscalProvince, setFiscalProvince] = useState(OS?.fiscalProvince ?? "");
  const [fiscalPostalCode, setFiscalPostalCode] = useState(OS?.fiscalPostalCode ?? "");
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
  const [dateState, setDateState] = useState<Date | undefined>(OS?.dateState ?? undefined);
  const [popoverEmisionOpen, setPopoverEmisionOpen] = useState(false);
  

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
        <DialogContent className="max-w-[1000px]">
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
                className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
                className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                placeholder="..."
                value={initials}
                disabled={true}
                onChange={(e) => setInitials(e.target.value)}
              />
            </div>
            <div />
            <div />
            <p className="col-span-4">Datos fiscales</p>

            <div>
              <Label className="text-xs">UNIDAD DE NEGOCIO</Label>
              <Select
                onValueChange={setBusinessUnit}
                value={businessUnit}
                disabled={true}
              >
                <SelectTrigger
                  className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                >
                  <SelectValue placeholder="Seleccione un tipo de ID" />
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
              <Label htmlFor="name" className="text-xs">
                RAZON SOCIAL
              </Label>
              <Input
                disabled={true}
                className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                id="name"
                placeholder="..."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">TIPO DOC. FISCAL</Label>
              <Select onValueChange={setFiscalIdType} value={fiscalIdType}>
                <SelectTrigger
                  className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
                className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
                  className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
                onValueChange={setIIBBStatus}
                value={IIBBStatus}
                disabled={true}
              >
                <SelectTrigger
                  className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
                className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                placeholder="..."
                value={IIBBNumber}
                onChange={(e) => setIIBBNumber(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="IdNumber" className="text-xs">
                CONDICION DE VENTA
              </Label>
              <Input
                disabled={true}
                id="IdNumber"
                className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right"
                placeholder="..."
                value={sellCondition}
                onChange={(e) => setSellCondition(e.target.value)}
              />
            </div>

            <div >
              <Label htmlFor="address" className="text-xs">
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
            <div >
              <Label htmlFor="address" className="text-xs">
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
            <div >
              <Label htmlFor="address" className="text-xs">
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
            <div >
              <Label htmlFor="address" className="text-xs">
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
            <div >
              <Label htmlFor="address" className="text-xs">
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
              <Label htmlFor="postal_code">Codigo Postal</Label>
              <Select onValueChange={setFiscalPostalCode} value={fiscalPostalCode}>
                <SelectTrigger                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
            <div >
              <Label htmlFor="address" className="text-xs">
                PAIS
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
            <div>
              <Label htmlFor="facturationName" className="text-xs">Nombre de facturacion</Label>
              <Input
                              className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
                              hover:none justify-self-right w-full"                
                id="facturationName"
                placeholder="..."
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
              />
            </div>
            <p className="col-span-4">Datos de Contacto</p>
            <div >
              <Label htmlFor="address" className="text-xs">
                DOMICILIO COMERCIAL
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div >
              <Label htmlFor="address" className="text-xs">
                PISO
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
            <div >
              <Label htmlFor="address" className="text-xs">
                PISO
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
              <Label htmlFor="locality">Localidad</Label>
              <Input
              className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="locality"
                placeholder="..."
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input
                            className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="province"
                placeholder="..."
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Codigo Postal</Label>
              <Select onValueChange={setPostalCode} value={postalCode}>
                <SelectTrigger className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
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
            <div >
              <Label htmlFor="address" className="text-xs">
                TELEFONO
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div >
              <Label htmlFor="address" className="text-xs">
                E-MAIL
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="address"
                placeholder="..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p className="col-span-4">Información de la cuenta</p>
            <div>
              <Label htmlFor="postal_code">ESTADO</Label>
              <Select onValueChange={setState} value={state}>
                <SelectTrigger                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full">
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
            <Label htmlFor="postal_code">FECHA DE ESTADO</Label>
            <Popover
                      open={popoverEmisionOpen}
                      onOpenChange={setPopoverEmisionOpen}>
                      <PopoverTrigger asChild={true}>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
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
                    <div >
              <Label htmlFor="user" className="text-xs">
                USUARIO
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="user"
                placeholder="..."
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
            <div >
              <Label htmlFor="cancelMotive" className="text-xs">
                MOTIVO DE BAJA
              </Label>
              <Input
                className=" mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right w-full"
                id="cancelMotive"
                placeholder="..."
                value={cancelMotive}
                onChange={(e) => setCancelMotive(e.target.value)}
              />
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
