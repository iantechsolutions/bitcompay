"use client"
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { AffiliatesInfo } from "./affiliates-info"; 
import { useState } from "react";

export default function Home() {
  const { data: grupo } = api.family_groups.list.useQuery();



  return (
    <LayoutContainer>
      <section className="space-y-2">
      <div className="flex justify-between">
  <Title>Afiliados</Title>
</div>
<Table>
  <TableCaption>Tabla de grupos familiares</TableCaption>
  <TableHeader>
    <TableRow className="flex">
      <TableHead className="flex-1 text-left">Grupo familiar</TableHead>
      <TableHead className="flex-1 text-left">Integrantes</TableHead>
      <TableHead className="flex-1 text-left">Estado</TableHead>
      <TableHead className="flex-1 text-left"></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {grupo ? (
      grupo.map((grupo) => (
        <TableRow key={grupo.id} className="flex">
          <TableCell className="flex-1 font-medium text-left">{grupo.numericalId}</TableCell>
          <TableCell className="flex-1  font-medium text-center">{grupo.integrants.length}</TableCell>
          <TableCell className="flex-1 text-center">{grupo.state}</TableCell>
          <td className="flex-1">
            <AffiliatesInfo grupoId={grupo.id} />
          </td>
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

       
      </section>
    </LayoutContainer>
  );
}
