"use client";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Landmark } from "lucide-react";
import LayoutContainer from "~/components/layout-container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/affiliate-page/affiliate-accordion";
import {
  Accordion as AccordionIntegrant,
  AccordionContent as AccordionContentIntegrant,
  AccordionItem as AccordionItemIntegrant,
  AccordionTrigger as AccordionTriggerIntegrant,
} from "~/components/affiliate-page/integrante-accordion";

import ActiveBadge from "~/components/active-badge";
import { Card } from "~/components/ui/card";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import { getDifferentialAmount, getGroupContribution } from "~/lib/utils";
import { RouterOutputs } from "~/trpc/shared";
import { useRouter } from "next/navigation";
import { SaldoPopoverAffiliates } from "./saldoPopoverAffiliates";
import ElementCard from "~/components/affiliate-page/element-card";

export default function AffiliatePage(props: {
  params: { affiliateId: string; companyId: string };
}) {
  const router = useRouter();
  // const company = props.params.companyId;
  const grupos = props.params.affiliateId;

  const { data: grupo } = api.family_groups.get.useQuery({
    family_groupsId: grupos!,
  });

  const { data: cc } = api.currentAccount.getByFamilyGroup.useQuery({
    familyGroupId: grupos ?? "",
  });
  // const cc = cuentasCorrientes?.find((cc) => cc.family_group === grupos);
  const { data: company } = api.companies.get.useQuery(undefined);
  const lastEvent = cc?.events.reduce((prev, current) => {
    return new Date(prev.createdAt) > new Date(current.createdAt)
      ? prev
      : current;
  });
  const { data: integrant } = api.integrants.getByGroup.useQuery({
    family_group_id: grupos!,
  });
  const bonusValido = grupo?.bonus?.find(
    (bonus) =>
      (bonus.from === null && bonus.to === null) ||
      (bonus.from !== null &&
        bonus.to !== null &&
        new Date().getTime() >= bonus.from.getTime() &&
        new Date().getTime() <= bonus.to.getTime())
  );
  const billResponsible = grupo?.integrants.find((x) => x.isBillResponsible);
  const paymentResponsible = grupo?.integrants.find((x) => x.isPaymentHolder);
  let pa: RouterOutputs["pa"]["get"];
  if (paymentResponsible?.pa && paymentResponsible.pa.length > 0) {
    pa = paymentResponsible?.pa.reduce((prev, current) => {
      return new Date(prev.createdAt) > new Date(current.createdAt)
        ? prev
        : current;
    });
  }
  const { data: comprobantesList } = api.comprobantes.list.useQuery();

  const comprobantes = comprobantesList
    ? comprobantesList.filter(
        (comprobante) => comprobante.family_group_id === grupos
      )
    : [];

  const familyGroupData = {
    "Unidad de negocio": grupo?.businessUnitData?.description,
    Modalidad: grupo?.modo?.description,
    Plan: grupo?.plan?.description,
    Vigencia: "",
    "O.S Asignada": "",
    "O.S Origen": "",
    Zona: "",
    Estado: grupo?.state,
    "Fecha estado": "",
    "Motivo baja": "",
    "Fecha alta": grupo?.validity
      ? dayjs.utc(grupo?.entry_date).startOf("day").format("YYYY-MM-DD")
      : "-",
    "Usuario alta": "",
    Vendedor: "",
    Supervisor: "",
    Gerencia: "",
  };

  const integrantsPersonalData = new Map<string, Record<string, string>>();
  const integrantsFiscalData = new Map<string, Record<string, string>>();
  const integrantsContactData = new Map<string, Record<string, string>>();
  const integrantsPlanData = new Map<string, Record<string, string>>();
  const additionalData = {
    PROMOCIÓN: bonusValido?.amount + " %" ?? "-",
    DESDE: bonusValido?.from
      ? dayjs(bonusValido?.from).startOf("day").format("YYYY-MM-DD")
      : "-",
    HASTA: bonusValido?.to
      ? dayjs(bonusValido?.to).startOf("day").format("YYYY-MM-DD")
      : "-",
    APORTES: grupo ? getGroupContribution(grupo) : "-",
    ORIGEN: "",
    "FECHA APORTES": "-",
    "PERIODO APORTADO": "-",
    "CUIT EMPLEADOR": "",
    DIFERENCIAL: grupo ? getDifferentialAmount(grupo, new Date()) : "-",
  };
  for (const integrant of grupo?.integrants ?? []) {
    const intPersonalData = {
      "TIPO DE DOCUMENTO": integrant.id_type ?? "-",
      "NUMERO DE DOCUMENTO": integrant.id_number ?? "-",
      "NRO. AFILIADO": integrant.affiliate_number ?? "-",
      EXTENSION: integrant.extention ?? "-",
      "NRO. CREDENCIAL": integrant.affiliate_number ?? "-",
      "FECHA DE NAC": dayjs(integrant.birth_date).format("YYYY-MM-DD") ?? "-",
      EDAD: integrant?.age?.toString() ?? "-",
      "GÉNERO:": integrant?.gender ?? "-",
      "ESTADO CIVIL:": integrant?.civil_status ?? "-",
      NACIONALIDAD: integrant?.nationality ?? "-",
    };
    const intFiscalData = {
      "CONDICION DE AFIP": integrant.afip_status ?? "-",
      "TIPO DE ID FISCAL": integrant.fiscal_id_type ?? "-",
      "NRO. FISCAL": integrant.fiscal_id_number ?? "-",
    };
    const intContactData = {
      DOMICILIO:
        integrant?.address ?? "" + " " + integrant?.address_number ?? "",
      PISO: integrant?.floor ?? "-",
      DEPARTAMENTO: integrant?.department ?? "-",
      LOCALIDAD: integrant?.locality ?? "-",
      PROVINCIA: integrant?.province ?? "-",
      "CODIGO POSTAL": integrant?.cp ?? "-",
      EMAIL: integrant?.email ?? "-",
      "TEL. PARTICULAR": integrant?.phone_number ?? "-",
      "TEL. MOVIL": integrant?.cellphone_number ?? "-",
    };
    const intPlanData = {
      "FECHA ALTA": "",
      ESTADO: "Activo",
      "FECHA ESTADO": "",
      PARENTESCO: integrant.relationship ?? "-",
      "MOTIVO BAJA": "",
      "USUARIO BAJA": "",
    };
    integrantsPlanData.set(integrant.id, intPlanData);
    integrantsContactData.set(integrant.id, intContactData);
    integrantsFiscalData.set(integrant.id, intFiscalData);
    integrantsPersonalData.set(integrant.id, intPersonalData);
  }

  const bankLogoMap = {
    default: <Landmark />,
    "Banco Industrial y Comercial de China": (
      <img src="/public/affiliates/icbcLogo.png" className="h-4 w-auto mr-2" />
    ),
  };

  const cardLogoMap = {
    Visa: <img src="/landing_images/VISA.png" className="h-9 w-auto ml-2" />,
    Mastercard: (
      <img src="/landing_images/MASTERCARD.png" className="h-4 w-auto ml-2" />
    ),
  };
  const paymentMethod: Record<string, React.ReactNode> = {
    "Débito Directo": (
      <>
        <div className="flex items-start gap-1">
          <ElementCard
            element={{ key: "CBU", value: "0000000000000000000000" }}
          />
          <ElementCard element={{ key: "ALIAS", value: "AAAA.AAA.AAA" }} />
        </div>

        <div className="mt-3">
          <ElementCard
            element={{
              key: "ENTIDAD BANCARIA",
              value: (
                <div className="flex items-center">
                  {" "}
                  {bankLogoMap["Banco Industrial y Comercial de China"]} Banco
                  Industrial y Comercial de China
                </div>
              ),
            }}
          />
        </div>
      </>
    ),
    Voluntario: (
      <div className="p-0">
        <h2 className="font-bold text-base mb-2">Redes Habilitadas: </h2>
        <div className="flex gap-4 items-center justify-start">
          <div className="flex gap-2 items-center">
            <img src="/public/affiliates/rapipago.png" className="h-5" />{" "}
            Rapipago
          </div>
          <div className="flex gap-2">
            <img src="/public/affiliates/pagofacil.png" className="h-5" />
            Pago Fácil
          </div>
          <div className="flex gap-2">
            <img src="/public/affiliates/pagomiscuentas.png" className="h-5" />{" "}
            Pagomiscuentas
          </div>
        </div>
      </div>
    ),
    "Débito Automático": (
      <div className="pl-4">
        <div className="flex justify-between">
          <ElementCard
            element={{
              key: "NOMBRE DE LA TARJETA",
              value: "Claudia Alejandra Perea",
            }}
          />
          <ElementCard
            element={{
              key: "NÚMERO DE TARJETA",
              value: (
                <div className="flex justify-between items-center">
                  **** **** **** 1234 {cardLogoMap["Visa"]}
                </div>
              ),
            }}
          />
        </div>
        <div className="flex justify-start gap-3 mt-3">
          <ElementCard element={{ key: "TIPO DE TARJETA", value: "Débito" }} />
          <ElementCard
            element={{ key: "FECHA DE VENC.", value: "01/12/2024" }}
          />
        </div>
      </div>
    ),
  };

  const goToCCDetail = (id: string | undefined) => {
    if (!id) return;
    router.push(
      `/management/client/affiliates/${props.params.affiliateId}/cc/${id}`
    );
  };

  return (
    <LayoutContainer>
      <section>
        <h2 className="text-2xl mt-4 font-semibold">
          Afiliados Nº {grupo?.numericalId}
        </h2>

        <div className="flex gap-3 mt-5 mb-10">
          <Card className="py-4 px-6 w-1/2 grid grid-cols-2 items-center">
            <div className="flex flex-col">
              <p className="text-base font-medium block">SALDO ACTUAL</p>
              <span className="text-[#EB2727] text-2xl font-bold">
                $
                {lastEvent?.current_amount !== undefined
                  ? lastEvent.current_amount.toFixed(2)
                  : "0.00"}
              </span>
            </div>
            <SaldoPopoverAffiliates
              ccId={cc?.id}
              healthInsuranceId={props.params.affiliateId}
            />
          </Card>
          <Card className="py-4 px-9 bg-[#DEF5DD] w-1/2 flex flex-col justify-center">
            <div className="flex flex-col  justify-center">
              <p className="text-sm font-medium block">PRÓXIMO VENCIMIENTO</p>
              <span className="text-[#3E3E3E] font-semibold text-xl">
                10/09/2024
              </span>
            </div>
          </Card>
        </div>
        <div className="">
          <Accordion
            className="w-full"
            defaultValue={["item-1", "item-2", "item-3"]}
            type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Datos del grupo familiar</AccordionTrigger>
              <AccordionContent className="pt-6 pl-5">
                <div className="grid grid-cols-5 gap-4 p-3 rounded-md">
                  {Object.entries(familyGroupData).map(([key, value]) => (
                    <ElementCard key={key} element={{ key, value }} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className=" rounded-md overflow-hidden">
                Integrantes
              </AccordionTrigger>
              <AccordionContent className="pt-6 pl-5">
                <AccordionIntegrant
                  type="multiple"
                  className="rounded-md overflow-hidden">
                  {integrant?.map((int) => (
                    <AccordionItemIntegrant value={int.id}>
                      <AccordionTriggerIntegrant
                        relationship={int?.relationship}>
                        {int.name}
                      </AccordionTriggerIntegrant>
                      <AccordionContentIntegrant>
                        <p className="text-xs font-semibold">
                          Informacion Personal
                        </p>
                        <div className="flex flex-wrap gap-4 bg-white pt-6">
                          {Object.entries(
                            integrantsPersonalData.get(int.id) ?? {}
                          ).map(([key, value]) => (
                            <ElementCard key={key} element={{ key, value }} />
                          ))}
                        </div>
                        <p className="text-xs font-semibold my-3 mt-8">
                          Información Fiscal
                        </p>
                        <div className="flex gap-2">
                          {Object.entries(
                            integrantsFiscalData.get(int?.id ?? "") ?? {}
                          ).map(([key, value]) => (
                            <ElementCard key={key} element={{ key, value }} />
                          ))}
                        </div>
                        <p className="text-xs font-semibold my-3 mt-8">
                          Información de contacto
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(
                            integrantsContactData.get(int?.id ?? "") ?? {}
                          ).map(([key, value]) => (
                            <ElementCard key={key} element={{ key, value }} />
                          ))}
                        </div>
                        <p className="text-xs font-semibold my-3 mt-8">
                          Información sobre el plan
                        </p>
                        <div className="flex gap-2">
                          {Object.entries(
                            integrantsPlanData.get(int?.id ?? "") ?? {}
                          ).map(([key, value]) => {
                            if (key === "Estado" && value === "Activo") {
                              return (
                                <ElementCard key={key} element={{ key, value }}>
                                  <ActiveBadge>Activo</ActiveBadge>
                                </ElementCard>
                              );
                            }
                            return (
                              <ElementCard key={key} element={{ key, value }} />
                            );
                          })}
                        </div>
                      </AccordionContentIntegrant>
                    </AccordionItemIntegrant>
                  ))}
                </AccordionIntegrant>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Datos de facturación</AccordionTrigger>
              <AccordionContent className="pt-8 pl-8">
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 bg-[#DEF5DD] pl-5 pr-6 pt-5 pb-14 w-1/3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img
                        src="/public/affiliates/billingType.png"
                        className="bg-[#DEF5DD] h-4"
                      />
                      Tipo de comprobante:
                    </div>

                    <p className="font-semibold pl-7 opacity-80">
                      {billResponsible?.afip_status == "CONSUMIDOR FINAL"
                        ? "B"
                        : "A"}{" "}
                    </p>
                    <div className="flex items-center gap-2">
                      <img
                        src="/public/affiliates/shopIcon.png"
                        className="bg-[#DEF5DD] h-4"
                      />
                      Condicion de Venta:
                    </div>
                    <p className="font-semibold pl-7 opacity-80">-</p>
                    <div className="flex items-center gap-2">
                      <img
                        src="/public/affiliates/modalityIcon.png"
                        className="bg-[#DEF5DD] h-4"
                      />
                      Modalidad de Pago:
                    </div>
                    <p className="font-semibold pl-7 opacity-80">
                      {" "}
                      Debito Directo
                    </p>
                  </div>
                  <div className="w-2/3 bg-[#DEF5DD] px-6 pt-5 pb-10 rounded-lg">
                    <h2 className="mb-3 text-lg font-normal">
                      Detalles del pago
                    </h2>
                    {paymentMethod["Voluntario"]}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 p-3  pt-6">
                  {Object.entries(additionalData).map(([key, value]) => (
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
