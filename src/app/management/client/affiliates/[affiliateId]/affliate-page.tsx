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
import "dayjs/locale/es";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");
import {
  Capitalize,
  cn,
  getDifferentialAmount,
  getGroupContribution,
} from "~/lib/utils";
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
  const { data: productos } = api.products.list.useQuery();

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
  const grupoPaymentMethod = billResponsible?.pa[0]?.product?.name;
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
    Vigencia: grupo?.validity
      ? dayjs(grupo?.validity).format("DD-MM-YYYY")
      : "-",
    "O.S Asignada":
      billResponsible?.healthInsurances?.identificationNumber ?? "-",
    "O.S Origen":
      billResponsible?.originatingHealthInsurances?.identificationNumber ?? "-",
    Zona: "-",
    Estado: grupo?.state,
    "Fecha estado": "",
    "Motivo baja": "",
    "Fecha alta": grupo?.charged_date
      ? dayjs.utc(grupo?.charged_date).startOf("day").format("DD-MM-YYYY")
      : "-",
    "Usuario alta": "",
    Vendedor: grupo?.seller ?? "-",
    Supervisor: grupo?.supervisor ?? "-",
    Gerencia: grupo?.gerency ?? "-",
  };

  const integrantsPersonalData = new Map<string, Record<string, string>>();
  const integrantsFiscalData = new Map<string, Record<string, string>>();
  const integrantsContactData = new Map<string, Record<string, string>>();
  const integrantsPlanData = new Map<string, Record<string, string>>();

  const formattedAportes = grupo
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(getGroupContribution(grupo))
    : "-";

  const additionalData = {
    PROMOCIÓN: bonusValido ? bonusValido?.amount + " %" : "-",
    DESDE: bonusValido?.from
      ? dayjs(bonusValido?.from).utc().format("DD-MM-YYYY")
      : "-",
    HASTA: bonusValido?.to
      ? dayjs(bonusValido?.to).utc().format("DD-MM-YYYY")
      : "-",
    APORTES: grupo ? formattedAportes : "-",
    ORIGEN: "",
    "FECHA APORTES": "-",
    "PERIODO APORTADO": "-",
    "CUIT EMPLEADOR": "",
    DIFERENCIAL: grupo
      ? getDifferentialAmount(grupo, new Date())?.toString()
      : "-",
  };

  for (const integrant of grupo?.integrants ?? []) {
    const intPersonalData = {
      "TIPO DOCUMENTO": integrant.id_type ?? "-",
      "Nº DOCUMENTO": integrant.id_number ?? "-",
      "Nº AFILIADO": integrant.affiliate_number ?? "-",
      EXTENSION: integrant.extention ? integrant?.extention : "-",
      "Nº. CREDENCIAL":
        (integrant.affiliate_number && integrant.extention)
          ? `${integrant.affiliate_number}-${integrant.extention}`
          : "-",
      "FECHA DE NAC": dayjs(integrant.birth_date).format("DD-MM-YYYY") ?? "-",
      EDAD: integrant?.age?.toString() ?? "-",
      "GÉNERO:": integrant?.gender ?? "-",
      "ESTADO CIVIL:": integrant?.civil_status ?? "-",
      NACIONALIDAD: integrant?.nationality ?? "-",
    };
    const intFiscalData = {
      "CONDICION DE AFIP": integrant.afip_status ?? "-",
      "TIPO DE ID FISCAL": integrant.fiscal_id_type ?? "-",
      "Nº. FISCAL": integrant.fiscal_id_number ?? "-",
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

  const prodId = billResponsible?.pa[0]?.product_id;
  const prod = productos?.find((x) => x.id === prodId);

  const paymentMethod = new Map<string, React.ReactNode>([
    [
      "DEBITO DIRECTO",
      <>
        <div className="flex items-start gap-1">
          <ElementCard
            element={{
              key: "CBU",
              value: billResponsible?.pa[0]?.CBU ?? "0000000000000000000000",
            }}
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
      </>,
    ],
    [
      "PAGO VOLUNTARIO",
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
      </div>,
    ],

    [
      "EFECTIVO",
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
          {/* <div className="flex gap-2">
            <img src="/public/affiliates/pagomiscuentas.png" className="h-5" />{" "}
            Pagomiscuentas
          </div> */}
        </div>
      </div>,
    ],
    [
      "DEBITO AUTOMATICO",
      <div className="pl-4">
        <div className="flex justify-between">
          <ElementCard
            element={{
              key: "NOMBRE DE LA TARJETA",
              value: billResponsible?.name ?? "Claudia Alejandra Perea",
            }}
          />
          <ElementCard
            element={{
              key: "NÚMERO DE TARJETA",
              value: (
                <div className="flex justify-between items-center">
                  **** **** ****
                  {billResponsible?.pa[0]
                    ? billResponsible?.pa[0].card_number?.slice(12, 16) ??
                      "1234"
                    : "1234"}
                  {cardLogoMap["Visa"]}
                </div>
              ),
            }}
          />
        </div>
        <div className="flex justify-start gap-3 mt-3">
          <ElementCard
            element={{
              key: "TIPO DE TARJETA",
              value: billResponsible?.pa[0]?.card_type ?? "Débito",
            }}
          />
          <ElementCard
            element={{
              key: "FECHA DE VENC.",
              value:
                dayjs(billResponsible?.pa[0]?.expire_date).format(
                  "DD/MM/YYYY"
                ) ?? "01/12/2024",
            }}
          />
        </div>
      </div>,
    ],
  ]);

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
          Grupo familiar Nº {grupo?.numericalId}
        </h2>

        <div className="flex gap-3 mt-5 mb-10">
          <Card className="flex-auto py-4 px-6 w-1/2  items-center">
            <div className=" grid grid-cols-2 items-center">
              <div>
                <p className="text-sm">SALDO ACTUAL</p>
                <span className="text-[#EB2727] text-xl font-bold">
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
            </div>
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
            type="multiple"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold" name="editIcon">
                Datos del grupo familiar
              </AccordionTrigger>
              <AccordionContent className="pt-6 pl-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-3 rounded-md">
                  {Object.entries(familyGroupData).map(([key, value]) => {
                    value =
                      typeof value === "string" ? Capitalize(value) : value;
                    return <ElementCard key={key} element={{ key, value }} />;
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger
                className="font-semibold rounded-md overflow-hidden"
                name="editIcon"
              >
                Integrantes
              </AccordionTrigger>
              <AccordionContent className="pt-6 pl-5">
                <AccordionIntegrant
                  type="multiple"
                  className="rounded-md overflow-hidden"
                >
                  {integrant?.map((int) => (
                    <AccordionItemIntegrant value={int.id}>
                      <AccordionTriggerIntegrant
                        relationship={int?.relationship}
                        affiliate={int}
                      >
                        {int.name}
                      </AccordionTriggerIntegrant>
                      <AccordionContentIntegrant>
                        <p className="text-xs font-semibold">
                          Informacion Personal
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-stretch pt-4">
                          {Object.entries(
                            integrantsPersonalData.get(int.id) ?? {}
                          ).map(([key, value]) => {
                            const isCredentialRelated =
                              key === "Nº. CREDENCIAL" ||
                              key == "EXTENSION" ||
                              key == "Nº AFILIADO" ||
                              key == "TIPO DOCUMENTO";
                            value =
                              typeof value === "string" && !isCredentialRelated
                                ? Capitalize(value)
                                : value;
                            return (
                              <ElementCard key={key} element={{ key, value }} />
                            );
                          })}
                        </div>
                        <p className="text-xs font-semibold my-3 mt-8">
                          Información Fiscal
                        </p>
                        <div className="flex flex-1 flex-wrap justify-start gap-8 pt-2">
                          {Object.entries(
                            integrantsFiscalData.get(int?.id ?? "") ?? {}
                          ).map(([key, value]) => {
                            value =
                              typeof value === "string" &&
                              key != "TIPO DE ID FISCAL"
                                ? Capitalize(value)
                                : value;
                            return (
                              <ElementCard key={key} element={{ key, value }} />
                            );
                          })}
                        </div>
                        <p className="text-xs font-semibold my-3 mt-8">
                          Información de contacto
                        </p>
                        <div className="flex flex-1 flex-wrap justify-start gap-8 pt-2">
                          {Object.entries(
                            integrantsContactData.get(int?.id ?? "") ?? {}
                          ).map(([key, value]) => {
                            value =
                              typeof value === "string" && key != "EMAIL"
                                ? Capitalize(value)
                                : value;
                            return (
                              <ElementCard key={key} element={{ key, value }} />
                            );
                          })}
                        </div>
                        <p className="text-xs font-semibold my-3 mt-8">
                          Información sobre el plan
                        </p>
                        <div className="flex flex-1 flex-wrap justify-start gap-8 pt-2">
                          {Object.entries(
                            integrantsPlanData.get(int?.id ?? "") ?? {}
                          ).map(([key, value]) => {
                            value =
                              typeof value === "string"
                                ? Capitalize(value)
                                : value;
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
              <AccordionTrigger className="font-semibold">
                Datos de facturación
              </AccordionTrigger>
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
                    <p className="font-semibold pl-7 opacity-80">{grupo?.sale_condition ?? "-"}</p>
                    <div className="flex items-center gap-2">
                      <img
                        src="/public/affiliates/modalityIcon.png"
                        className="bg-[#DEF5DD] h-4"
                      />
                      Modalidad de Pago:
                    </div>
                    <p className="font-semibold pl-7 opacity-80">
                      {" "}
                      {prod?.name ?? "no se pudo encontrar el producto"}
                    </p>
                  </div>
                  <div className="w-2/3 bg-[#DEF5DD] px-6 pt-5 pb-10 rounded-lg">
                    <h2 className="mb-3 text-lg font-normal">
                      Detalles del pago
                    </h2>
                    {paymentMethod && paymentMethod?.has(prod?.name ?? "") ? (
                      <div className="flex gap-4 items-start">
                        {paymentMethod.get(prod?.name ?? "")}
                      </div>
                    ) : (
                      <div className="flex gap-4 items-start">
                        {paymentMethod.get("Pago Voluntario")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-stretch p-3 pt-6">
                  {Object.entries(additionalData).map(([key, value]) => {
                    const isEmpty = value === "-" || !value;
                    const isPeriod =
                      key === "PERIODO APORTADO" || key === "FECHA APORTES";
                    if (isEmpty && isPeriod) return null;
                    value =
                      typeof value === "string" ? Capitalize(value) : value;
                    return <ElementCard key={key} element={{ key, value }} />;
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </LayoutContainer>
  );
}
