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
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
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
dayjs.extend(utc);
dayjs.locale("es");

type Inputs = {
  name: string;
  identificationNumber: string;
};

export default function HealthInsurancePage(props: {
  healthInsurance: RouterOutputs["healthInsurances"]["get"];
}) {
  const router = useRouter();
  const [name, setName] = useState(props.healthInsurance!.name!);
  const [idNumber, setIdNumber] = useState(
    props.healthInsurance!.identificationNumber!
  );

  const [isPending, setIsLoading] = useState<boolean>(false);
  const [openPopover, setOpenPopover] = useState<boolean>(false);

  const { mutateAsync: updateHealthInsurance, isLoading } =
    api.healthInsurances.change.useMutation();

  const { mutateAsync: deleteHealthInsurance } =
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

  const basicData = {
    Código: "123123",
    Sigla: "1232",
    "Razón Social": "23123",
    CUIT: "44398273",
    "Condición AFIP": "asdfdf",
    "Condición IIBB": "asdfsdf",
    "Nro. IIBB": "dasdf",
    "Domicilio Comercial": "cordoba 233",
    Piso: "1",
    Oficina: "3",
    Localidad: "tigre",
    Provincia: "Buenos Aires",
    "Código Postal": "1133",
    Teléfono: "1123232",
    "E-mail": "fulanito@gmail.com",
    Estado: "Gran provinvia de Bs As",
    "Fecha de Estado": "12/12/12",
    "Motivo de baja": "Ninguno",
    "Usuario baja": "fulanito",
  };

  const facturacion = {
    "Unidad de negocio": "Cristal Salud",
    Provincia: "Buenos Aires",
    Oficina: "123",
    "Domicilio Fiscal": "Entre rios 123",
    Piso: "1",
    "Condicion de venta": "Mixto",
    "Codigo postal": "1233",
    Localidad: "Jose C Paz",
  };
  return (
    <div>
      <Link
        className="w-20 h-auto flex justify-between"
        href={`/dashboard/management/client/health_insurances`}
      >
        <ArrowLeftIcon /> Volver
      </Link>
      <LayoutContainer>
        <section className="space-y-2">
          <div>
            <h2 className="text-xl mt-2">Cuadro de saldo en Cta. Cte.:</h2>
          </div>
          <div className="border rounded-lg border-[#20E0B9] mt-2 p-4 w-1/4">
            <p className="text-lg font-semibold">Saldo O.S Nro.</p>
            <span className="text-[#CD3D3B] text-2xl font-bold">-$10000</span>
          </div>
          <div className="w-full border-b-2 border-[#20E0B9]">
            <h2 className="text-xl mt-2">Datos Básicos:</h2>
          </div>
          <div className="grid grid-cols-4 px-6 py-5">
            {Object.entries(basicData).map(([key, value]) => (
              <div key={key} className="flex flex-col mb-2">
                <p className="font-extrabold text-[0.9rem] text-[#3e3e3e]">
                  {key}:{" "}
                </p>
                <div className="text-sm text-[#3e3e3e] opacity-75">{value}</div>
              </div>
            ))}
          </div>
          <div className="w-full border-b-2 border-[#20E0B9]">
            <h2 className="text-xl mt-2">Facturación:</h2>
          </div>
          <div className="grid grid-cols-4 px-6 py-5">
            {Object.entries(facturacion).map(([key, value]) => (
              <div key={key} className="flex flex-col mb-2">
                <p className="font-extrabold text-[0.9rem] text-[#3e3e3e]">
                  {key}:{" "}
                </p>
                <div className="text-sm text-[#3e3e3e] opacity-75">{value}</div>
              </div>
            ))}
          </div>
        </section>
      </LayoutContainer>
    </div>
  );
}
