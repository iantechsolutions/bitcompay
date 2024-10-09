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
import { Card } from "~/components/ui/card";
import Upload02Icon from "~/components/icons/upload-02-stroke-rounded";
import ElementCard from "~/components/affiliate-page/element-card";
import Link from "next/link";
dayjs.extend(utc);
dayjs.locale("es");

export default function NonOsPage(props: {
  healthInsurance: RouterOutputs["healthInsurances"]["get"];
}) {
  const router = useRouter();

  const { data: bussinesUnit } = api.bussinessUnits.get.useQuery({
    bussinessUnitId: props.healthInsurance?.businessUnit ?? "",
  });
  
  const {data: postalCodes} = api.postal_code.list.useQuery();
  const { data: cc } = api.currentAccount.getByHealthInsurance.useQuery({
    healthInsuranceId: props.healthInsurance?.id ?? "",
  });
  let currentAmount = 0;

  let lastEvent;
  if (cc?.events) {
    lastEvent = cc?.events.reduce((prev, current) => {
      return new Date(prev.createdAt) > new Date(current.createdAt)
        ? prev
        : current;
    });
  }
  currentAmount = lastEvent?.current_amount ?? 0;
  const { mutateAsync: updateHealthInsurance, isLoading } =
    api.healthInsurances.change.useMutation();


  const fiscalData = {
    "Unidad de negocio": bussinesUnit?.description,
    "Razón Social": props.healthInsurance?.responsibleName,
    CUIT: props.healthInsurance?.fiscal_id_number,
    "Condición AFIP": props.healthInsurance?.afip_status,
    "Condicion de IIBB": props.healthInsurance?.IIBBStatus,
    "Numero IIBB": props.healthInsurance?.IIBBNumber,
    "Condición de venta": props.healthInsurance?.sellCondition,
  };
  const fiscalPostalCode= postalCodes?.find((postalCode) => postalCode.id === props.healthInsurance?.fiscalPostalCode);
  const facturacion = {
    "Domicilio fiscal": props.healthInsurance?.fiscalAddress,
    Piso: props.healthInsurance?.fiscalFloor,
    Oficina: props.healthInsurance?.fiscalOffice,
    Localidad: props.healthInsurance?.fiscalLocality,
    Provincia: props.healthInsurance?.fiscalProvince,
    "Codigo postal": fiscalPostalCode?.cp ?? "No se encontro C.P.",
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
    "Fecha de estado": dayjs(props.healthInsurance?.dateState).format("DD/MM/YYYY"),
    Usuario: props.healthInsurance?.user,
    "Motivo de baja": props.healthInsurance?.cancelMotive,
  };1

  return (
    <LayoutContainer>
      <section>
        <div className="flex flex-row justify-between mt-4">
          <div className="flex flex-row  gap-6">
            <h2 className="flex items-center text-2xl font-semibold mb-2">
              Obra Social
            </h2>
            <h3 className="flex items-center text-lg font-medium">
              {props?.healthInsurance?.identificationNumber}{" "}
              {props?.healthInsurance?.initials}
            </h3>
          </div>
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
