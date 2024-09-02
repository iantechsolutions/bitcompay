"use client";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { TableRecord } from "./columns";
import { AddHealthInsurances } from "./AddHealthInsurances";

export default function Home() {
  const obraSocial = api.healthInsurances.list.useQuery().data;
  const tableRecords: TableRecord[] = [];
  if (obraSocial) {
    for (const os of obraSocial) {
      tableRecords.push({
        id: os.id!,
        name: os.name,
        identificationNumber:
          os?.identificationNumber ?? "SIN NRO DE IDENTIFICACION",
        responsibleName: os?.responsibleName ?? "SIN NOMBRE DE RESPONSABLE",
        fiscal_id_number: os?.fiscal_id_number ?? "SIN CUIL/CUIT",
        afip_status: os?.afip_status ?? "SIN ESTADO AFIP",
      });
    }
  }
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Obras sociales</Title>
          <AddHealthInsurances healthInsurance={null} />
        </div>
        <DataTable columns={columns} data={tableRecords} />
      </section>
    </LayoutContainer>
  );
}
