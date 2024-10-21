import { useEffect, useState } from "react";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { RouterOutputs } from "~/trpc/shared";
import { Calendar } from "../ui/calendar";
import Calendar01Icon from "../icons/calendar-01-stroke-rounded";
import { es } from "date-fns/locale";

interface EditAffiliateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  Affiliate?: RouterOutputs["integrants"]["getByGroup"][number];
}

export default function EditAffiliate({
  open,
  setOpen,
  Affiliate,
}: EditAffiliateProps) {
  // Estados para todos los campos

  const [estado, setEstado] = useState(Affiliate?.state ?? "");
  const [motivoBaja, setMotivoBaja] = useState("");
  const [zona, setZona] = useState(Affiliate?.zone ?? "");

  const { data: zonas } = api.zone.list.useQuery();
  const { data: postalCode } = api.postal_code.list.useQuery();

  // Nuevos campos
  const [affiliateType, setAffiliateType] = useState(
    Affiliate?.affiliate_type ?? ""
  );
  const [relationship, setRelationship] = useState(
    Affiliate?.relationship ?? ""
  );

  const [cps, setCP] = useState(Affiliate?.cp ?? "");
  const [idType, setIdType] = useState(Affiliate?.id_type ?? "");
  const [idNumber, setIdNumber] = useState(Affiliate?.id_number ?? "");
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    Affiliate?.birth_date ?? undefined
  );
  const [gender, setGender] = useState<"MASCULINO" | "FEMENINO" | "OTRO">(
    Affiliate?.gender ?? "OTRO"
  );
  const [civilStatus, setCivilStatus] = useState<
    "SOLTERO" | "CASADO" | "DIVORCIADO" | "VIUDO"
  >(Affiliate?.civil_status ?? "SOLTERO");
  const [nationality, setNationality] = useState(Affiliate?.nationality ?? "");
  const [afipStatus, setAfipStatus] = useState<
    "MASCULINO" | "FEMENINO" | "OTRO" | string
  >(Affiliate?.afip_status ?? "CONSUMIDOR FINAL");
  const [fiscalIdType, setFiscalIdType] = useState(
    Affiliate?.fiscal_id_type ?? ""
  );
  const [fiscalIdNumber, setFiscalIdNumber] = useState(
    Affiliate?.fiscal_id_number ?? ""
  );
  const [address, setAddress] = useState(Affiliate?.address ?? "");
  const [addressNumber, setAddressNumber] = useState(
    Affiliate?.address_number ?? ""
  );
  const [phoneNumber, setPhoneNumber] = useState(Affiliate?.phone_number ?? "");
  const [cellphoneNumber, setCellphoneNumber] = useState(
    Affiliate?.cellphone_number ?? ""
  );
  const [email, setEmail] = useState(Affiliate?.email ?? "");
  const [locality, setLocality] = useState(Affiliate?.locality ?? "");
  const [province, setProvince] = useState(Affiliate?.province ?? "");
  const [cp, setCp] = useState(Affiliate?.cp ?? "");
  const [name, setName] = useState(Affiliate?.name ?? "");
  const router = useRouter();
  const [openCalendar, setOpenCalendar] = useState(false);

  const { mutateAsync: updateAffiliate, isLoading } =
    api.integrants.change.useMutation();

  // useEffect(() => {
  //   if (Affiliate) {
  //     setName(Affiliate.name ?? "");
  //     setZona(Affiliate.zone ?? "");
  //     setEstado(Affiliate.state ?? "");
  //     setAffiliateType(Affiliate.affiliate_type ?? "");
  //     setRelationship(Affiliate.relationship ?? "");
  //     setIdType(Affiliate.id_type ?? "");
  //     setIdNumber(Affiliate.id_number ?? "");
  //     setBirthDate(Affiliate.birth_date ?? new Date());
  //     setGender(Affiliate.gender ?? "MASCULINO");
  //     setCivilStatus(Affiliate.civil_status ?? "SOLTERO");
  //     setNationality(Affiliate.nationality ?? "");
  //     setAfipStatus(Affiliate.afip_status ?? "CONSUMIDOR FINAL");
  //     setFiscalIdType(Affiliate.fiscal_id_type ?? "");
  //     setFiscalIdNumber(Affiliate.fiscal_id_number ?? "");
  //     setAddress(Affiliate.address ?? "");
  //     setAddressNumber(Affiliate.address_number ?? "");
  //     setPhoneNumber(Affiliate.phone_number ?? "");
  //     setCellphoneNumber(Affiliate.cellphone_number ?? "");
  //     setEmail(Affiliate.email ?? "");
  //     setLocality(Affiliate.locality ?? "");
  //     setProvince(Affiliate.province ?? "");
  //     setCp(Affiliate.cp ?? "");
  //   }
  // }, [Affiliate]);

  function validateFields() {
    const errors: string[] = [];
    if (!name) errors.push("Nombre");
    if (!estado) errors.push("estado");
    if (!birthDate) errors.push("fecha de Nacimiento");
    if (!civilStatus) errors.push("estado Civil");
    if (!fiscalIdType) errors.push("Tipo de ID Fiscal");
    if (!fiscalIdNumber) errors.push("Número de ID Fiscal");
    if (!afipStatus) errors.push("Estado AFIP");
    return errors;
  }

  async function HandleUpdate() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
    }

    try {
      await updateAffiliate({
        name,
        id: Affiliate?.id ?? "",
        state: estado,
        affiliate_type: affiliateType,
        relationship,
        id_type: idType,
        id_number: idNumber,
        birth_date: birthDate,
        gender,
        civil_status: civilStatus,
        nationality,
        afip_status: afipStatus,
        fiscal_id_type: fiscalIdType,
        fiscal_id_number: fiscalIdNumber,
        address,
        address_number: addressNumber,
        phone_number: phoneNumber,
        cellphone_number: cellphoneNumber,
        email,
        localidad: locality,
        provincia: province,
        cp: cp,
        zona: zona ?? null,
        // family_group_id: "",
        // floor: "",
        // department: "",
        // partido: "",
        // isHolder: false,
        // isPaymentHolder: false,
        // isAffiliate: false,
        // isBillResponsible: false,
        // extention: "",
        // postal_codeId: "",
      });
      setOpen(false);
      router.refresh();
      toast.success("Afiliado actualizado correctamente");
    } catch (e) {
      return toast.error("No se pudo guardar los cambios");
    }
  }

  const handleCivilStatusChange = (value: string) => {
    if (
      value === "SOLTERO" ||
      value === "CASADO" ||
      value === "DIVORCIADO" ||
      value === "VIUDO"
    ) {
      setCivilStatus(value);
    }
  };
  const handleGenderChange = (value: string) => {
    if (value === "MASCULINO" || value === "FEMENINO" || value === "OTRO") {
      setGender(value as "MASCULINO" | "FEMENINO" | "OTRO");
    }
  };
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="bitcompay"
        className="absolute right-10 text-sm px-4 h-5 justify-center text-[#3e3e3e] rounded-full font-medium z-0">
        <Edit02Icon className="h-3" /> Editar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] gap-4 m-4 rounded-2xl p-4">
          <DialogHeader>
            <div className="flex items-center">
              <Edit02Icon className="mr-1 h-3" />
              <DialogTitle className="text-sm">
                Modificar Información del Afiliado
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4">
            <DialogTitle className="text-xs col-span-4">
              Información Personal
            </DialogTitle>
            <div>
              <Label htmlFor="name" className="text-xs mb-2 block">
                Nombre
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>

            <div>
  <Label htmlFor="birthDate" className="text-xs text-gray-500">
    Fecha de Nacimiento
  </Label>
  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
    <PopoverTrigger asChild={true} autoFocus={false}>
      <Button
        variant={"outline"}
        className={cn(
          "text-left flex justify-between font-medium w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none pr-0 pl-0",
          !birthDate && "text-muted-foreground"
        )}
        onClick={() => setOpenCalendar(!openCalendar)}
      >
        {birthDate ? (
          format(birthDate, "dd/MM/yyyy", { locale: es })
        ) : (
          <span>Seleccionar fecha</span>
        )}
        <Calendar01Icon className="h-4 w-4" />
        </Button>
       </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
      <Calendar
        mode="single"
        selected={birthDate}
        onSelect={(date) => {
          setBirthDate(date);
          setOpenCalendar(false);
        }}
        initialFocus={true}
            />
          </PopoverContent>
          </Popover>
          </div>

            <div>
              <Label htmlFor="civilStatus" className="text-xs mb-2 block">
                Estado Civil
              </Label>
              <Select
                onValueChange={(value) => handleCivilStatusChange(value)}
                value={civilStatus}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione un estado civil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOLTERO">Soltero</SelectItem>
                  <SelectItem value="CASADO">Casado</SelectItem>
                  <SelectItem value="DIVORCIADO">Divorciado</SelectItem>
                  <SelectItem value="VIUDO">Viudo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="civilStatus" className="text-xs mb-2 block">
                Genero
              </Label>
              <Select
                onValueChange={(value) => handleGenderChange(value)}
                value={gender}>
                <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione un estado civil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMENINO">Femenino</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estado" className="text-xs mb-2 block">
                Estado
              </Label>
              <Select onValueChange={setEstado} value={estado}>
                <SelectTrigger className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione uno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {estado === "INACTIVO" && (
              <div>
                <Label htmlFor="motivoBaja" className="text-xs mb-2 block">
                  Motivo Baja
                </Label>
                <Input
                  type="text"
                  id="motivoBaja"
                  value={motivoBaja}
                  onChange={(e) => setMotivoBaja(e.target.value)}
                  className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
                />
              </div>
            )}

            <DialogTitle className="text-xs col-span-4">
              Información Fiscal
            </DialogTitle>
            <div>
              <Label htmlFor="fiscalIdType" className="text-xs mb-2 block">
                Tipo de ID Fiscal
              </Label>
              <Input
                type="text"
                id="fiscalIdType"
                value={fiscalIdType}
                onChange={(e) => setFiscalIdType(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="fiscalIdNumber" className="text-xs mb-2 block">
                Número de ID Fiscal
              </Label>
              <Input
                type="text"
                id="fiscalIdNumber"
                value={fiscalIdNumber}
                onChange={(e) => setFiscalIdNumber(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">CONDICIÓN AFIP</Label>
              <Select onValueChange={setAfipStatus} value={afipStatus}>
                <SelectTrigger className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione uno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONOTRIBUTISTA">Monotributista</SelectItem>
                  <SelectItem value="RESPONSABLE INSCRIPTO">
                    Responsable inscripto
                  </SelectItem>
                  <SelectItem value="EXENTO">Exento</SelectItem>
                  <SelectItem value="CONSUMIDOR FINAL">
                    Consumidor final
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogTitle className="text-xs col-span-4">
              Información de Contacto
            </DialogTitle>

            <div>
              <Label htmlFor="addressNumber" className="text-xs mb-2 block">
                Número
              </Label>
              <Input
                type="text"
                id="addressNumber"
                value={addressNumber}
                onChange={(e) => setAddressNumber(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber" className="text-xs mb-2 block">
                Teléfono
              </Label>
              <Input
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="cellphoneNumber" className="text-xs mb-2 block">
                Celular
              </Label>
              <Input
                type="text"
                id="cellphoneNumber"
                value={cellphoneNumber}
                onChange={(e) => setCellphoneNumber(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs mb-2 block">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-xs mb-2 block">
                Dirección
              </Label>
              <Input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>

            <div>
              <Label htmlFor="locality" className="text-xs mb-2 block">
                Localidad
              </Label>
              <Input
                type="text"
                id="locality"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="province" className="text-xs mb-2 block">
                Provincia
              </Label>
              <Input
                type="text"
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="zona" className="text-xs text-gray-500">
                Zona
              </Label>
              <Select onValueChange={setZona} value={zona}>
                <SelectTrigger className="mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none hover:none justify-self-right w-full">
                  <SelectValue placeholder="0" />
                </SelectTrigger>
                <SelectContent>
                  {zonas?.map((zonass) => (
                    <SelectItem key={zonass.id} value={zonass.name}>
                      {zonass.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postal_code" className="text-xs text-gray-500">
                Código Postal
              </Label>
              <Select onValueChange={setCp} value={cp}>
                <SelectTrigger className="mb-2 border-[#bef0bb] border-b text-[#3E3E3E] bg-background rounded-none shadow-none hover:none justify-self-right w-full">
                  <SelectValue placeholder="0" />
                </SelectTrigger>
                <SelectContent>
                  {postalCode?.map((cp) => (
                    <SelectItem key={cp.id} value={cp.name}>
                      {cp.cp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              className=" bg-[#F7F7F7] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-xs rounded-full py-1 px-5">
              Cancelar
            </Button>
            <Button
              onClick={HandleUpdate}
              disabled={isLoading}
              variant="bitcompay"
              className="font-medium text-xs rounded-full py-1 px-5  text-[#3e3e3e] z-0">
              Modificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
