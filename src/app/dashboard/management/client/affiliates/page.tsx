"use client";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function Home() {
  const { data: grupo } = api.family_groups.list.useQuery();
  const linked = (link: string) => {
    window.location.href = link;
  };

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div>
          <Title>Afiliados</Title>
        </div>
        <Table>
          <TableCaption>Tabla de grupos familiares</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo familiar</TableHead>
              <TableHead>Integrantes</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grupo ? (
              grupo.map((grupo) => (
                <TableRow
                  key={grupo.id}
                  className="hover:cursor-pointer"
                  onClick={() =>
                    linked(
                      `/dashboard/management/client/affiliates/${grupo.id}`
                    )
                  }>
                  <TableCell>{grupo.numericalId}</TableCell>
                  <TableCell className="text-justify">
                    {grupo.integrants.length}
                  </TableCell>
                  <TableCell className="text-justify">{grupo.state}</TableCell>
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
