"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Button } from "~/components/ui/button";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { type RouterOutputs } from "~/trpc/shared";
import { Eye } from "lucide-react";
import LayoutContainer from "~/components/layout-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/affiliate-page/affiliate-accordion";
import { AddHealthInsurances } from "../AddHealthInsurances";
import { Card } from "~/components/ui/card";
import Upload02Icon from "~/components/icons/upload-02-stroke-rounded";
import ElementCard from "~/components/affiliate-page/element-card";
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

  let lastEvent;
  if (cc?.events && cc.events.length > 0) {
    lastEvent = cc?.events.reduce((prev, current) => {
      return new Date(prev.createdAt) > new Date(current.createdAt)
        ? prev
        : current;
    });
    currentAmount = lastEvent?.current_amount ?? 0;
  } else {
    currentAmount = 0;
  }
  currentAmount = lastEvent?.current_amount ?? 0;
  const [openBasicData, setOpenBasicData] = useState<boolean>(false);
  const [openFacturacion, setOpenFacturacion] = useState<boolean>(false);

  const { mutateAsync: updateHealthInsurance, isLoading } =
    api.healthInsurances.change.useMutation();

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

  // const { mutateAsync: deleteHealthInsurance, isLoading: isDeleting } =
  //   api.healthInsurances.delete.useMutation();

  // const [openDelete, setOpenDelete] = useState<boolean>(false);

  // async function handleDelete() {
  //   try {
  //     setIsLoading(true);
  //     const os = await deleteHealthInsurance({
  //       healthInsuranceId: props.healthInsurance!.id,
  //     });

  //     toast.success("Obra social eliminada correctamente");
  //     router.push("./");
  //   } catch (e) {
  //     const error = asTRPCError(e)!;
  //     toast.error(
  //       "No puede eliminarse obras sociiales con afiliados asociados"
  //     );
  //   }
  // }

  const fiscalData = {
    "Unidad de negocio": props.healthInsurance?.businessUnit,
    "Razón Social": props.healthInsurance?.responsibleName,
    CUIT: props.healthInsurance?.fiscal_id_number,
    "Condición AFIP": props.healthInsurance?.afip_status,
    "Condicion de IIBB": props.healthInsurance?.IIBBStatus,
    "Numero IIBB": props.healthInsurance?.IIBBNumber,
    "Condición de venta": props.healthInsurance?.sellCondition,
  };

  const facturacion = {
    "Domicilio fiscal": props.healthInsurance?.fiscalAddress,
    Piso: props.healthInsurance?.fiscalFloor,
    Oficina: props.healthInsurance?.fiscalOffice,
    Localidad: props.healthInsurance?.fiscalLocality,
    Provincia: props.healthInsurance?.fiscalProvince,
    "Codigo postal": props.healthInsurance?.fiscalPostalCode,
    País: props.healthInsurance?.fiscalCountry,
  };

  const contactData = {
    "Domicilio Comercial": props.healthInsurance?.adress,
    Piso: props.healthInsurance?.floor,
    Oficina: props.healthInsurance?.office,
    Localidad: props.healthInsurance?.locality,
    Provincia: props.healthInsurance?.province,
    "Codigo postal": props.healthInsurance?.postal_code,
    Telefono: props.healthInsurance?.phoneNumber,
    "E-mail": props.healthInsurance?.email,
  };

  const accountInfo = {
    Estado: props.healthInsurance?.state,
    "Fecha de estado": JSON.stringify(props.healthInsurance?.dateState),
    Usuario: props.healthInsurance?.user,
    "Motivo de baja": props.healthInsurance?.cancelMotive,
  };

  return (
    <div>
      <Link
        className=" font-monserrat w-20 h-auto flex justify-between"
        href={`/management/client/health_insurances`}>
        <ArrowLeftIcon className="mb-2" /> Volver
      </Link>
      <LayoutContainer>
        <section className="space-y-2">
          <div className="flex w-full justify-between">
            <h2 className="text-lg font-monserrat font-semibold mt-2">
              Obra Social
            </h2>
            <div>
              <AddHealthInsurances healthInsurance={props?.healthInsurance} />
              <Button
                variant={"destructive"}
                className="ml-10"
                onClick={() => setOpenDelete(true)}>
                Eliminar
              </Button>
            </div>
          </div>
          <AddHealthInsurances healthInsurance={props?.healthInsurance} />
        </div>
        <div className="flex gap-3 mt-5 mb-10">
          <Card className="flex-auto py-4 px-6 w-1/2  items-center">
            <div className="grid grid-cols-2 items-center">
              <div>
                <p className="text-sm font-medium">SALDO ACTUAL</p>
                <span className="text-[#CD3D3B] text-center text-xl font-bold">
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
                    `/management/client/health_insurances/${props.healthInsuranceId}/cc/${props.ccId}`
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
          </Card>
        </div>
        <div>
          <Accordion className="w-full" type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold" name="editIcon">
                Datos Básicos
              </AccordionTrigger>
              <AccordionContent className="pt-6 pl-5">
                <h3 className="font-bold text-md mb-4">Datos Fiscales</h3>
                <div className="grid grid-cols-4 gap-6 p-3 rounded-md">
                  {Object.entries(fiscalData).map(([key, value]) => (
                    <ElementCard key={key} element={{ key, value }} />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-6 p-3 rounded-md">
                  {Object.entries(facturacion).map(([key, value]) => (
                    <ElementCard key={key} element={{ key, value }} />
                  ))}
                </div>
                <h3 className="font-bold text-md my-4">Datos de Contacto</h3>
                <div className="grid grid-cols-4 gap-6 p-3 rounded-md">
                  {Object.entries(contactData).map(([key, value]) => (
                    <ElementCard key={key} element={{ key, value }} />
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </LayoutContainer>
  );
}
