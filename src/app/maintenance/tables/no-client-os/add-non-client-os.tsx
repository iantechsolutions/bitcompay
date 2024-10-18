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

export function AddNonClientOs(props: {
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
  const [isClient, setIsClient] = useState<boolean>(OS?.isClient ?? false);

  const [dateState, setDateState] = useState<Date | undefined>(
    OS?.dateState ?? undefined
  );
  const [popoverEmisionOpen, setPopoverEmisionOpen] = useState(false);

  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [responsibleName, setResponsibleName] = useState(
    OS?.responsibleName ?? ""
  );
  const [initialValue, setInitialValue] = useState("0");

  function validateFields() {
    const errors: string[] = [];
    if (!identificationNumber) errors.push("Codigo");
    if (!initials) errors.push("Sigla");
    if (!description) errors.push("Descripcion");

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
        isClient: false,
        fiscal_id_number: fiscalIdNumber.toString() ?? "",
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
        fiscal_id_number: fiscalIdNumber.toString() ?? "",
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
            Agregar obra social no cliente
          </>
        )}
      </AddElementButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[1000px] max-h-[95vh] gap-4 rounded-2xl py-8 px-14 overflow-y-scroll">
          <DialogHeader>
            {OS ? (
              <DialogTitle>Editar obra social no cliente</DialogTitle>
            ) : (
              <DialogTitle>Agregar obra social no cliente</DialogTitle>
            )}
          </DialogHeader>
          <div className="grid grid-cols-4 gap-y-4 gap-x-8 justify-between">
            <div>
              <Label htmlFor="name" className="text-xs text-gray-500">
                NOMBRE
              </Label>
              <Input
                id="name"
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder=""
                value={razonsocial}
                onChange={(e) => setRazonsocial(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fiscalIdNumber" className="text-xs text-gray-500">
                CUIT
              </Label>
              <Input
                id="fiscalIdNumber"
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder="0"
                type="number"
                value={fiscalIdNumber}
                onChange={(e) => setFiscalIdNumber(e.target.value)}
              />
            </div>
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
              <Label className="text-xs text-gray-500">DESCRIPCIÓN</Label>
              <Input
                id="description"
                className="w-full border-[#bef0bb] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                placeholder=""
                value={description}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div />
            <div />
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
                    Agregar obra social
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
