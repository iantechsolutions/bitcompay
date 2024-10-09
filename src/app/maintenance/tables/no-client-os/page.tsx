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
        name: os.name ?? "SIN NOMBRE",
        identificationNumber:
          os?.identificationNumber ?? "SIN NRO DE IDENTIFICACION",
        siglas: os?.initials ?? "SIN SIGLAS",
        description: os?.description ?? "SIN DESCRIPCION",
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
