"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { type RouterOutputs } from "~/trpc/shared";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  ArrowLeftIcon,
  ChevronDown,
  CircleChevronDown,
  CircleChevronUp,
  Eye,
  Loader2Icon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import Link from "next/link";
import LayoutContainer from "~/components/layout-container";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";
import { SaldoPopover } from "./saldoPopover";
import { Separator } from "~/components/ui/separator";
import { AddHealthInsurances } from "../AddHealthInsurances";
dayjs.extend(utc);
dayjs.locale("es");

export default function HealthInsurancePage(props: {
  ccId: any;
  healthInsuranceId: any;
  healthInsurance: RouterOutputs["healthInsurances"]["getWithComprobantes"];
}) {
  const router = useRouter();
  const [name, setName] = useState(props.healthInsurance!.name!);
  const [idNumber, setIdNumber] = useState(
    props.healthInsurance!.identificationNumber!
  );
  const [isPending, setIsLoading] = useState<boolean>(false);
  const { data: cc } = api.currentAccount.getByHealthInsurance.useQuery({
    healthInsuranceId: props.healthInsurance?.id ?? "",
  });
  let currentAmount = 0;
  if (cc?.events) {
    const lastEvent = cc?.events.reduce((prev, current) => {
      return new Date(prev.createdAt) > new Date(current.createdAt)
        ? prev
        : current;
    });
    currentAmount = lastEvent?.current_amount ?? 0;
  }
  const [openBasicData, setOpenBasicData] = useState<boolean>(false);
  const [openFacturacion, setOpenFacturacion] = useState<boolean>(false);

  const { mutateAsync: updateHealthInsurance, isLoading } =
    api.healthInsurances.change.useMutation();

  const { mutateAsync: deleteHealthInsurance, isLoading: isDeleting } =
    api.healthInsurances.delete.useMutation();

  async function handleUpdate() {
    try {
      await updateHealthInsurance({
        healthInsuranceId: props.healthInsurance!.id,
        name,
        identificationNumber: idNumber,
      });

      toast.success("Obra social actualizada correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  async function handleDelete() {
    try {
      setIsLoading(true);
      await deleteHealthInsurance({
        healthInsuranceId: props.healthInsurance!.id,
      });

      toast.success("Obra social eliminada correctamente");
      router.push("./");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  const fiscalData = {
    Código: props.healthInsurance?.identificationNumber,
    Sigla: "-",
    "Razón Social": props.healthInsurance?.responsibleName,
    CUIT: props.healthInsurance?.fiscal_id_number,
    "Condición AFIP": props.healthInsurance?.afip_status,
    "Condicion de IIBB": "-",
    "Numero IIBB": "-",
  };

  const contactData = {
    "Domicilio Comercial": props.healthInsurance?.adress,
    Piso: "-",
    Oficina: "-",
    Localidad: "-",
    Provincia: "-",
    "Codigo postal": props.healthInsurance?.cpData?.cp ?? "-",
    Telefono: "-",
    "E-mail": "example@gmail.com",
  };

  const basicData = { ...fiscalData, ...contactData };

  const facturacion = {
    "Unidad de negocio": "-",
    Provincia: "-",
    Oficina: "-",
    Piso: "-",
    "Condicion de venta": "-",
    "Codigo postal": "-",
    Localidad: "-",
  };

  const postal_code = {
    "Codigo postal": props.healthInsurance?.cpData?.cp ?? "-",
  };
  return (
    <div>
      <Link
        className=" font-monserrat w-20 h-auto flex justify-between"
        href={`/dashboard/management/client/health_insurances`}>
        <ArrowLeftIcon className="mb-2" /> Volver
      </Link>
      <LayoutContainer>
        <section className="space-y-2">
          <div className="flex w-full justify-between">
            <h2 className="text-lg font-monserrat font-semibold mt-2">
              Obra Social
            </h2>
            <div>
              <AddHealthInsurances OSId={props.healthInsuranceId} />
              <Button
                variant={"destructive"}
                className="ml-10"
                onClick={() => setOpenDelete(true)}>
                Eliminar
              </Button>
            </div>
          </div>
          <div className="border rounded-lg border-gray-200 mt-2 p-4 w-1/2">
            <div className="flex flex-row justify-between items-center">
              <div>
                <p className="text-md">SALDO OBRA SOCIAL</p>
                <span className="text-[#CD3D3B] text-2xl font-bold">
                  $ {currentAmount}
                </span>
              </div>
              <Button
                className="flex flex-row bg-[#F7F7F7] hover:bg-[#DEF5DD] text-black font-medium-medium text-xs rounded-2xl py-1 px-3"
                onClick={() => {
                  if (!props.ccId) {
                    alert("ccId is undefined");
                    return;
                  }
                  router.push(
                    `/dashboard/management/client/health_insurances/${props.healthInsuranceId}/cc/${props.ccId}`
                  );
                }}>
                <Eye className="mr-2 w-4 h-4" />
                Ver movimientos
              </Button>
            </div>
          </div>

          <div className="border rounded-lg border-gray-200 p-4 w-full relative">
            <div className="flex justify-between items-center">
              <h2 className="text-md font-semibold">Datos Básicos</h2>
              <button
                onClick={() => setOpenBasicData(!openBasicData)}
                className="absolute top-0 right-0 mt-4 mr-4 text-gray-400">
                {openBasicData ? (
                  <CircleChevronUp className="w-5 h-5" />
                ) : (
                  <CircleChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
            {openBasicData && (
              <div className="px-6 py-5">
                <h3 className="font-bold text-md mb-4">Datos Fiscales</h3>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(fiscalData).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <p className="font-extrabold text-sm text-[#3e3e3e]">
                        {key}:
                      </p>
                      <div className="text-sm text-[#3e3e3e] opacity-75">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="m-4" />
                <h3 className="font-bold text-md mb-4">Datos de Contacto</h3>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(contactData).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <p className="font-extrabold text-sm text-[#3e3e3e]">
                        {key}:
                      </p>
                      <div className="text-sm text-[#3e3e3e] opacity-75">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border rounded-lg border-gray-200 p-4 w-full relative">
            <div className="flex justify-between items-center">
              <h2 className="text-md font-semibold">Facturación</h2>
              <button
                onClick={() => setOpenFacturacion(!openFacturacion)}
                className="absolute top-0 right-0 mt-4 mr-4 text-gray-400">
                {openFacturacion ? (
                  <CircleChevronUp className="w-5 h-5" />
                ) : (
                  <CircleChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
            {openFacturacion && (
              <div className="px-6 py-5">
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(facturacion).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <p className="font-extrabold text-sm text-[#3e3e3e]">
                        {key}:
                      </p>
                      <div className="text-sm text-[#3e3e3e] opacity-75">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Dialog open={openDelete} onOpenChange={setOpenDelete}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Seguro que desea la obra social?</DialogTitle>
              </DialogHeader>

              <DialogFooter>
                <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
                <Button disabled={isDeleting} onClick={handleDelete}>
                  {isDeleting && (
                    <Loader2Icon className="mr-2 animate-spin" size={20} />
                  )}
                  Eliminar obra social
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </LayoutContainer>
    </div>
  );
}
