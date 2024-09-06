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
import { AffiliatesTableRecord } from "./columns";
import { DataTable } from "./data-table";
import { columns } from "./columns";
export default function Home() {
  const { data: grupos, isLoading } =
    api.family_groups.listWithIntegrantsPlanAndModo.useQuery();
  console.log("grupos", grupos);
  const linked = (link: string) => {
    window.location.href = link;
  };

  if (isLoading)
    return (
      <LayoutContainer>
        <div>Cargando...</div>{" "}
      </LayoutContainer>
    );
  if (!grupos) return <div>no hay grupos familiares para mostrar</div>;
  const tableRecords: AffiliatesTableRecord[] = [];
  for (const grupo of grupos) {
    const billResponsible = grupo.integrants.find(
      (integrant) => integrant.isBillResponsible
    );

    tableRecords.push({
      id: grupo.id,
      nroGF: grupo.numericalId,
      nombre: billResponsible?.name ?? "Sin responsable pagador",
      cuil: billResponsible?.fiscal_id_number ?? "Sin CUIL",
      integrantes: grupo.integrants.length,
      "Estados GF": grupo.state ?? "Sin estado",
      fechaEstado: grupo.validity!,
      Marca: grupo?.businessUnitData?.brand?.name ?? "",
      Plan: grupo?.plan?.description ?? "",
      UN: grupo?.businessUnitData?.description ?? "",
      Modalidad: grupo?.modo?.description ?? "",
    });
  }
  console.log("TableRecords", tableRecords);
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div>
          <Title>Afiliados</Title>
        </div>

        <DataTable columns={columns} data={tableRecords} />
      </section>
    </LayoutContainer>
  );
}
