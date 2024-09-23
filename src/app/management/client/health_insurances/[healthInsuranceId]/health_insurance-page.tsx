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
    <LayoutContainer>
      <section>
        <div className="flex flex-row justify-between mt-4">
          <div className="flex flex-row  gap-6">
            <h2 className="flex items-center text-2xl font-semibold">
              Obra Social
            </h2>
            <h3 className="flex items-center text-lg font-medium">
              {props.healthInsurance?.identificationNumber}{" "}
              {props.healthInsurance?.initials}
            </h3>
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
              <div>
                <Button
                  className="flex flex-row bg-[#F7F7F7] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-xs rounded-full py-1 px-5"
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
          </Card>
          <Card className="py-4 px-9 bg-[#DEF5DD] w-1/2 flex flex-col justify-center">
            <div className="flex flex-row place-items-center justify-between">
              <p className="text-base font-[550] block place-content-center text-[#3e3e3e]">
                Soportes
              </p>
              <Button
                variant="bitcompay"
                className="bg-[#85CE81] text-sm px-4 h-7 gap-2 text-[#ffffff] rounded-full font-normal">
                <Upload02Icon className="h-4" />
                Subir archivo
              </Button>
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
                <h3 className="font-bold text-md my-4">
                  Información de la cuenta
                </h3>
                <div className="grid grid-cols-4 gap-6 p-3 rounded-md">
                  {Object.entries(accountInfo).map(([key, value]) => (
                    <ElementCard key={key} element={{ key, value }} />
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
