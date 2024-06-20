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
} from "~/components/ui/table";
import { Title } from "~/components/title";

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

  const { data: integrant } = api.integrants.getByGroup.useQuery({
    family_group_id: grupos!,
  });

  const { data: facturasList } = api.facturas.list.useQuery();

  const facturas = facturasList
    ? facturasList.filter((factura) => factura.family_group_id === grupos)
    : [];

  const [open, setOpen] = useState(false);

  return (
    <div>
      <Link
        className="w-20 h-auto flex justify-between"
        href={`/dashboard/${company}/management/client/affiliates`}>
        <ArrowLeftIcon /> Volver
      </Link>
      <LayoutContainer>
        <section className="space-y-2">
          <div className="mb-5 m-10">
            <Title>Información de los integrantes</Title>
          </div>
          <div>
            <Table>
              <TableHeader>
                <TableRow className="flex">
                  <TableHead className="flex-1 text-center">Nombre</TableHead>
                  <TableHead className="flex-1 text-center">Edad</TableHead>
                  <TableHead className="flex-1 text-center w-[100px]">
                    Genero
                  </TableHead>
                  <TableHead className="flex-1 text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrant ? (
                  integrant.map((integrant) => (
                    <TableRow key={integrant.id} className="flex">
                      <TableCell className="flex-1 font-medium text-center">
                        {integrant.name}
                      </TableCell>
                      <TableCell className="flex-1 text-center">
                        {integrant.age}
                      </TableCell>
                      <TableCell className="flex-1 text-center">
                        {integrant.gender}
                      </TableCell>
                      <TableCell className="flex-1 text-center">
                        {integrant.state}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay afiliados disponibles.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <div className="mb-5 mt-10">
              <Title>Cuenta corriente</Title>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="flex">
                  <TableHead className="flex-1 text-left">
                    Descripcion
                  </TableHead>
                  <TableHead className="flex-1 text-left">Creacion</TableHead>
                  <TableHead className="flex-1 text-left">Tipo</TableHead>
                  <TableHead className="flex-1 text-left w-[100px]">
                    Monto
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cc ? (
                  cc.events.map((events) => (
                    <TableRow key={events.id} className="flex">
                      <TableCell className="flex-1 font-medium text-left">
                        {events.description}
                      </TableCell>
                      <TableCell className="flex-1 text-left">
                        {new Date(events.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell className="flex-1 text-left">
                        {events.type?.toString()}
                      </TableCell>
                      <TableCell className="flex-1 text-left">
                        {events.current_amount?.toString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay cuenta corriente disponible.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <div className="mb-5 mt-10">
              <Title>Ultimos movimientos</Title>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="flex">
                  <TableHead className="flex-1 text-left">Numero</TableHead>
                  <TableHead className="flex-1 text-left w-[100px]">
                    Fecha
                  </TableHead>
                  <TableHead className="flex-1 text-left">IVA</TableHead>
                  <TableHead className="flex-1 text-left">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facturas ? (
                  facturas.slice(0, 4).map((factura) => (
                    <TableRow key={factura.id} className="flex">
                      <TableCell className="flex-1 font-medium text-left">
                        N° {factura.nroFactura}
                      </TableCell>
                      <TableCell className="flex-1 text-left">
                        {new Date(
                          factura.generated ?? new Date()
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="flex-1 text-left">
                        {factura.iva}%
                      </TableCell>
                      <TableCell className="flex-1 text-left">
                        {factura.importe}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay afiliados disponibles.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </LayoutContainer>
    </div>
  );
}
