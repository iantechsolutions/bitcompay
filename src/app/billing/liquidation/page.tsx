import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import { auth } from "@clerk/nextjs/server";
import { type TableRecord } from "./columns";
import { columns } from "./columns";
import { DataTable } from "./data-table";
dayjs.extend(utc);
dayjs.locale("es");

export default async function Page() {
  const liquidationsFull = await api.liquidations.list.query();
  //filter liquidations where companyId is equal to the companyId in the URL and estado: "pendiente"
  const { orgId } = auth();
  const possibleBrands = await api.brands.list.query();

  const liquidations = liquidationsFull.filter(
    (liquidation) => liquidation.estado === "aprobada"
  );
  const tableData: TableRecord[] = [];

  // console.log(brandNames, "Ejemplo");

  for (const liquidation of liquidations) {
    tableData.push({
      id: liquidation?.id!,
      number: String(liquidation?.number) ?? "NO NUMBER",
      Marca: liquidation.brand?.name ?? "NO BRAND",
      period: dayjs(liquidation?.period).format("MM-YYYY"),
      cuit: liquidation?.cuit ?? "NO CUIT",
      UN: liquidation?.bussinessUnits?.description ?? "NO BU",
    });
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Liquidaciones Aprobadas</Title>
        </div>
        <DataTable columns={columns} data={tableData} />
      </section>
    </LayoutContainer>
  );
}
