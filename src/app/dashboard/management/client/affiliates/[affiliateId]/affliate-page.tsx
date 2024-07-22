"use client";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { ArrowLeftIcon } from "lucide-react";
import { PlusCircle } from "lucide-react";
import LayoutContainer from "~/components/layout-container";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";
import { Title } from "~/components/title";
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
export default function AffiliatePage(props: {
  params: { affiliateId: string; companyId: string };
}) {
  const company = props.params.companyId;
  const grupos = props.params.affiliateId;

  const { data: grupo } = api.family_groups.get.useQuery({
    family_groupsId: grupos!,
  });

  const { data: cuentasCorrientes } = api.currentAccount.list.useQuery();
  const cc = cuentasCorrientes?.find((cc) => cc.family_group === grupos);
  const lastEvent = cc?.events[0];
  const { data: integrant } = api.integrants.getByGroup.useQuery({
    family_group_id: grupos!,
  });

  const { data: comprobantesList } = api.comprobantes.list.useQuery();

  const comprobantes = comprobantesList
    ? comprobantesList.filter(
        (comprobante) => comprobante.family_group_id === grupos
      )
    : [];

  const familyGroupData = {
    "Unidad de negocio": "",
    Vigencia: "",
    Modalidad: "",
    "O.S Origen": "",
    "O.S Asignada": "",
    Plan: "",
    Zona: "",
    "Fecha alta": "",
    "Usuario alta": "",
    Estado: "",
    "Fecha estado": "",
    "Motivo baja": "",
    Vendedor: "",
    Supervisor: "",
    Gerencia: "",
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
          <div className="mt-2 border border-[#A7D3C7] p-4 w-1/2 rounded-lg">
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
                  <div className="grid grid-cols-5 gap-4 ml-3 ">
                    {Object.entries(familyGroupData).map(([key, value]) => (
                      <p>
                        <span className="font-semibold">{key}:</span> {value}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Integrantes</AccordionTrigger>
                <AccordionContent className="pt-6 pl-5">
                  <AccordionIntegrant type="multiple">
                    {integrant?.map((int) => (
                      <AccordionItemIntegrant value={int.id}>
                        <AccordionTriggerIntegrant>
                          {int.name}
                        </AccordionTriggerIntegrant>
                        <AccordionContentIntegrant>
                          <div className="grid grid-cols-5 gap-4 ml-3 ">
                            <p>
                              <span className="font-semibold">
                                Tipo de documento:{" "}
                              </span>
                              {int.id_type}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Numero de documento:{" "}
                              </span>
                              {int.id_number}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Tipo de ID fiscal:{" "}
                              </span>
                              {int.fiscal_id_type}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Nro. fiscal:{" "}
                              </span>
                              {int.fiscal_id_number}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Condicion fiscal:{" "}
                              </span>
                              {int.afip_status}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Nro. Afiliado:{" "}
                              </span>
                              {int?.affiliate_number}
                            </p>
                            <p>
                              <span className="font-semibold">Extension: </span>
                              *****
                            </p>
                            <p>
                              <span className="font-semibold">
                                Nro. Credencial{" "}
                              </span>
                              ******
                            </p>
                            <p>
                              <span className="font-semibold">Genero:</span>{" "}
                              {int.gender}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Fecha de Nac:{" "}
                              </span>
                              {dayjs(int?.birth_date).format("YYYY-MM-DD")}
                            </p>
                            <p>
                              <span className="font-semibold"> Edad</span>
                              {int.age}
                            </p>
                            <p>
                              <span className="font-semibold">
                                {" "}
                                Estado Civil:{" "}
                              </span>
                              {int.civil_status}
                            </p>
                            <p>
                              <span className="font-semibold">
                                {" "}
                                Nacionalidad
                              </span>
                              {int?.nationality}
                            </p>
                            <p>
                              <span className="font-semibold">Calle: </span>
                              {int?.address}
                            </p>
                            <p>
                              <span className="font-semibold">Nro: </span>
                              {int?.address_number}
                            </p>
                            <p>
                              <span className="font-semibold">Piso </span>
                              {int?.floor}
                            </p>
                            <p>
                              <span className="font-semibold">Depto: </span>
                              {int?.department}
                            </p>
                            <p>
                              <span className="font-semibold">Localidad: </span>
                              {int?.locality}
                            </p>
                            <p>
                              <span className="font-semibold">Provincia: </span>
                              {int?.state}
                            </p>
                            <p>
                              <span className="font-semibold"> CP: </span>
                              {int?.cp}
                            </p>
                            <p>
                              <span className="font-semibold"> Tel: </span>
                              {int?.phone_number}
                            </p>
                            <p>
                              <span className="font-semibold">Email: </span>
                              {int?.email}
                            </p>
                            <p>
                              <span className="font-semibold">F. Alta: </span>
                            </p>
                            <p>
                              <span className="font-semibold">Estado: </span>
                            </p>
                            <p>
                              <span className="font-semibold">
                                Fecha EStado:{" "}
                              </span>
                            </p>
                            <p>
                              <span className="font-semibold">
                                Motivo baja:{" "}
                              </span>
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
                      <p className="font-semibold">Tipo de comprobante</p>
                      <p className="font-semibold">Condicion de Venta</p>
                      <p className="font-bold">Modalidad de Pago: </p>
                    </div>
                    <p>Voluntario:</p>
                    <div className="w-full h-20 border border-[#A7D3C7] rounded-lg"></div>
                    <p>Debito Directo:</p>
                    <div className="w-full h-20 border py-2 px-4 flex items-center justify-around border-[#A7D3C7] rounded-lg">
                      {Object.entries({
                        Codigo: 234234,
                        Banco: "Banco Galicia",
                        CBU: 123123123,
                      }).map(([key, value]) => (
                        <p>
                          <span className="font-semibold">{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                    <p>Debito automatico: </p>
                    <div className="w-full h-20 border py-2 px-4 flex items-center justify-around border-[#A7D3C7] rounded-lg">
                      {Object.entries({
                        "Tipo de Tarjeta": 234234,
                        "Nro de Tarjeta": "923904280",
                        Banco: "Santander",
                      }).map(([key, value]) => (
                        <p>
                          <span className="font-semibold">{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                    <div className="grid grid-cols-2">
                      <p>
                        <span className="font-bold">Aportes del GF: </span>
                      </p>
                      <p>
                        <span className="font-bold">Fecha Aportes: </span>
                      </p>
                      <p>
                        <span className="font-bold">Periodo Aportado: </span>
                      </p>
                      <p>
                        <span className="font-bold">CUIT Empleador: </span>
                      </p>
                      <p>
                        <span className="font-bold">Promocion: </span>
                      </p>
                      <p>
                        <span className="font-bold">
                          Diferenciales del GF:{" "}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </LayoutContainer>
    </div>
  );
}
