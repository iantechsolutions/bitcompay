import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import {List, ListTile} from "~/components/list";
import { AddNonClientOs } from "./add-non-client-os";
import { DataTable } from "./data-table";
import {columns, type TableRecord} from "./columns";
interface Props {}
export default async function Home(props: Props) {
  const no_client_os = await api.healthInsurances.listNonClient.query();
  const tableRecords: TableRecord[] = [];
  if (no_client_os) {
    for (const os of no_client_os) {
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
          <Title>Obras sociales no clientes</Title>
          <AddNonClientOs healthInsurance={null}/>
        </div>
        <DataTable columns={columns} data={tableRecords} />
      </section>
    </LayoutContainer>
  );
}
