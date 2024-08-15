"use client";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { ArrowLeftIcon } from "lucide-react";

import LayoutContainer from "~/components/layout-container";
import Link from "next/link";

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
import dayjs from "dayjs";
import { getDifferentialAmount, getGroupContribution } from "~/lib/utils";
import { RouterOutputs } from "~/trpc/shared";
import { useRouter } from "next/navigation";
import { router } from "@trpc/server";
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
    // "O.S Origen": grupo?.origin_os.,
    // Vendedor: "",
    Plan: grupo?.plan?.description,
    // "O.S Asignada": "",
    // "Usuario alta": "",
    Modalidad: grupo?.modo?.description,
    "Fecha estado": "",
    "Motivo baja": "",
    Vigencia: "",
    Estado: grupo?.state,
    // Gerencia: "",
    "Fecha alta": dayjs(grupo?.validity).format("YYYY-MM-DD"),
    Zona: "",
    Supervisor: "",
  };
  const goToCCDetail = (id: string | undefined) => {
    if (!id) return;
    router.push(
      `/dashboard/management/client/affiliates/${props.params.affiliateId}/cc/${id}`
    );
  };

  return (
    <div>
      <Link
        className="w-20 h-auto flex justify-between"
        href={`/dashboard/management/client/affiliates`}
      >
        <ArrowLeftIcon /> Volver
      </Link>
      <LayoutContainer>
        <section className="space-y-2">
          <div>
            <h2 className="text-xl mt-2">Afiliados</h2>
          </div>
          <div
            className="mt-2 border border-[#A7D3C7] p-4 w-1/2 rounded-lg hover:cursor-pointer hover:bg-[#f0f0f0d1]"
            onClick={() => {
              goToCCDetail(cc?.id);
            }}
          >
            <p className="text-lg font-semibold">Saldo actual</p>
            <span className="text-[#CD3D3B] text-2xl font-bold">
              $ {lastEvent?.current_amount}
            </span>
          </div>
          <div>
            <Accordion
              className="w-full"
              defaultValue={["item-1", "item-2", "item-3"]}
              type="multiple"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>Datos del grupo familiar</AccordionTrigger>
                <AccordionContent className="pt-6 pl-5">
                  <div className="grid grid-cols-5 gap-4 p-3 bg-[#e9fcf8] rounded-md">
                    {Object.entries(familyGroupData).map(([key, value]) => (
                      <p>
                        <span className="font-semibold">{key}:</span>
                        <br /> {value}
                      </p>
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
                    className="rounded-md overflow-hidden"
                  >
                    {integrant?.map((int) => (
                      <AccordionItemIntegrant value={int.id}>
                        <AccordionTriggerIntegrant className="bg-[#e9fcf8]">
                          {int.name + " - " + int?.relationship}
                        </AccordionTriggerIntegrant>
                        <AccordionContentIntegrant>
                          <div className="grid grid-cols-5 gap-4 p-3 bg-[#e9fcf8] pt-6">
                            <p>
                              <span className="font-semibold">
                                Tipo de documento:{" "}
                              </span>
                              <br />
                              {int.id_type ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Numero de documento:{" "}
                              </span>
                              <br />
                              {int.id_number ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Nro. Afiliado:{" "}
                              </span>
                              <br />
                              {int?.affiliate_number ?? "-"}
                            </p>

                            <p>
                              <span className="font-semibold">Extension: </span>
                              <br />
                              {int?.extention ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Nro. Credencial{" "}
                              </span>
                              <br />
                              {int?.affiliate_number ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Fecha de Nac:{" "}
                              </span>
                              <br />
                              {dayjs(int?.birth_date).format("YYYY-MM-DD") ??
                                "-"}
                            </p>
                            <p>
                              <span className="font-semibold"> Edad</span>
                              <br />
                              {int.age ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">Genero:</span>{" "}
                              <br />
                              {int.gender ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                {" "}
                                Estado Civil:{" "}
                              </span>
                              <br />
                              {int.civil_status ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                {" "}
                                Nacionalidad
                              </span>
                              <br />
                              {int?.nationality ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Condicion de AFIP:{" "}
                              </span>
                              <br />
                              {int.afip_status ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Tipo de ID fiscal:{" "}
                              </span>
                              <br />
                              {int.fiscal_id_type ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Nro. fiscal:{" "}
                              </span>
                              <br />
                              {int.fiscal_id_number ?? "-"}
                            </p>

                            <p>
                              <span className="font-semibold">Domicilio: </span>
                              <br />
                              {int?.address ??
                                "" + " " + int?.address_number ??
                                ""}
                            </p>
                            <p>
                              <span className="font-semibold">Piso </span>
                              <br />
                              {int?.floor ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Departamento:{" "}
                              </span>
                              <br />
                              {int?.department ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">Localidad: </span>
                              <br />
                              {int?.locality ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">Provincia: </span>
                              <br />
                              {int?.province ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                {" "}
                                Codigo Postal:{" "}
                              </span>
                              <br />
                              {int?.cp ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">Email: </span>
                              <br />
                              {int?.email ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                {" "}
                                Tel. particular:{" "}
                              </span>
                              <br />
                              {int?.phone_number ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                {" "}
                                Tel. movil:{" "}
                              </span>
                              <br />
                              {int?.cellphone_number ?? "-"}
                            </p>

                            <p>
                              <span className="font-semibold">
                                Fecha Alta:{" "}
                              </span>
                            </p>
                            <p>
                              <span className="font-semibold">Estado: </span>
                              <br />
                            </p>
                            <p>
                              <span className="font-semibold">
                                Fecha Estado:{" "}
                              </span>
                              <br />
                            </p>
                            <p>
                              <span className="font-semibold">
                                Parentesco:{" "}
                              </span>
                              <br />
                              {int?.relationship ?? "-"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Motivo baja:{" "}
                              </span>
                              <br />
                            </p>
                            <p>
                              <span className="font-semibold">
                                Usuario baja:{" "}
                              </span>
                              <br />
                            </p>
                          </div>
                        </AccordionContentIntegrant>
                      </AccordionItemIntegrant>
                    ))}
                  </AccordionIntegrant>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Datos de facturación</AccordionTrigger>
                <AccordionContent className="pt-8 pl-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <p>
                        <span className="font-semibold">
                          Tipo de comprobante:{" "}
                        </span>
                        {billResponsible?.afip_status == "CONSUMIDOR FINAL"
                          ? "B"
                          : "A"}
                      </p>
                      <p className="font-semibold">Condicion de Venta:</p>
                      <p className="font-bold">Modalidad de Pago: </p>
                    </div>
                    {company?.products.some(
                      (product) => product.product.name == "PAGO VOLUNTARIO"
                    ) && <p>-Voluntario</p>}
                    {company?.products.some(
                      (product) => product.product.name == "EFECTIVO"
                    ) && <p>-Efectivo</p>}
                    {company?.products.some(
                      (product) =>
                        product.product.name == "DEBITO DIRECTO CBU" && pa
                    ) && (
                      <>
                        <p>-Debito Directo:</p>
                        <div className="w-full h-20 border py-2 px-4 flex items-center justify-around border-[#A7D3C7] rounded-lg">
                          {Object.entries({
                            CBU: pa?.CBU,
                          }).map(([key, value]) => (
                            <p>
                              <span className="font-semibold">{key}:</span>{" "}
                              {value}
                            </p>
                          ))}
                        </div>
                      </>
                    )}
                    {/* <div className="w-full h-20 border border-[#A7D3C7] rounded-lg"></div> */}
                    {company?.products.some(
                      (product) =>
                        product.product.name == "DEBITO AUTOMATICO" && pa
                    ) && (
                      <>
                        <p>-Debito Automatico:</p>
                        <div className="w-full h-20 border py-2 px-4 flex items-center justify-around border-[#A7D3C7] rounded-lg">
                          {Object.entries({
                            "Marca de tarjeta": pa?.card_brand,
                            "Tipo de tarjeta": pa?.card_type,
                            "Nro. de tarjeta": pa?.card_number,
                          }).map(([key, value]) => (
                            <p>
                              <span className="font-semibold">{key}:</span>{" "}
                              {value}
                            </p>
                          ))}
                        </div>
                      </>
                    )}
                    {company?.products.some(
                      (product) =>
                        product.product.name == "DEBITO DIRECTO PLUS" && pa
                    ) && (
                      <>
                        <p>-Debito Directo Plus:</p>
                        <div className="w-full h-20 border py-2 px-4 flex items-center justify-around border-[#A7D3C7] rounded-lg">
                          {Object.entries({
                            "Marca de tarjeta": pa?.card_brand,
                            "Tipo de tarjeta": pa?.card_type,
                            "Nro. de tarjeta": pa?.card_number,
                          }).map(([key, value]) => (
                            <p>
                              <span className="font-semibold">{key}:</span>{" "}
                              {value}
                            </p>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-5 gap-4 p-3 bg-[#e9fcf8] pt-6">
                      <p>
                        <span className="font-bold">Promocion:</span>
                        <br />
                        {bonusValido?.amount + " %" ?? "-"}
                      </p>
                      <p>
                        <span className="font-bold">Desde: </span>
                        <br />
                        {dayjs(bonusValido?.from).format("YYYY-MM-DD") ?? "-"}
                      </p>
                      <p>
                        <span className="font-bold">Hasta: </span>
                        <br />
                        {dayjs(bonusValido?.to).format("YYYY-MM-DD") ?? "-"}
                      </p>
                      <p>
                        <span className="font-bold">Diferencial: </span>
                        <br />
                        {grupo ? getDifferentialAmount(grupo, new Date()) : "-"}
                      </p>
                      <p>
                        <span className="font-bold">Aportes: </span>
                        <br />
                        {grupo ? getGroupContribution(grupo) : "-"}
                      </p>
                      <p>
                        <span className="font-bold">Fecha Aportes: </span>
                        <br />-
                      </p>
                      <p>
                        <span className="font-bold">Periodo Aportado: </span>
                        <br />-
                      </p>
                      {/* <p>
                        <span className="font-bold">CUIT Empleador: </span>
                      </p> */}

                      {/* <p>
                        <span className="font-bold">
                          Diferenciales del GF:{" "}
                        </span>
                      </p> */}
                    </div>
                  </div>
                  {/* <div className="mt-3">
                    <Table>
                      <TableHeader>
                        <TableRow className="flex border-b border-[#4af0d4] py text-left text-base text-[#737171] font-bold opacity-70 h-6">
                          <TableHead className="flex-1 text-center">
                            Integrante
                          </TableHead>
                          <TableHead className="flex-1 text-center">
                            Cuotas
                          </TableHead>
                          <TableHead className="flex-1 text-center">
                            Descuentos
                          </TableHead>
                          <TableHead className="flex-1 text-center">
                            Aportes
                          </TableHead>
                          <TableHead className="flex-1 text-center">
                            Diferencial
                          </TableHead>
                          <TableHead className="flex-1 text-center">
                            Sub-Total
                          </TableHead>
                          <TableHead className="flex-1 text-center">
                            IVA
                          </TableHead>
                          <TableHead className="flex-1 text-center">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="flex border-b border-[#A7D3C7] py-[0.25rem] text-[#737171] font-semibold opacity-70">
                          <TableCell className=" flex-1 text-center">
                            Nombre Integrante
                          </TableCell>
                          <TableCell className=" flex-1 text-center">
                            {" "}
                            $ cuota
                          </TableCell>
                          <TableCell className=" flex-1 text-center">
                            {" "}
                            $ descuento
                          </TableCell>
                          <TableCell className=" flex-1 text-center">
                            {" "}
                            $ aportes
                          </TableCell>
                          <TableCell className=" flex-1 text-center">
                            {" "}
                            $ diferencial
                          </TableCell>
                          <TableCell className=" flex-1 text-center">
                            {" "}
                            $ sub-total
                          </TableCell>
                          <TableCell className=" flex-1 text-center">
                            {" "}
                            $ iva
                          </TableCell>
                          <TableCell className=" flex-1 text-center">
                            {" "}
                            $ total
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div> */}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </LayoutContainer>
    </div>
  );
}
