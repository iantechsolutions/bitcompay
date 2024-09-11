"use client";
import { FileText } from "lucide-react";
import { Title } from "~/components/title";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import LayoutContainer from "~/components/layout-container";
import { Button } from "~/components/ui/button";
import { type TableRecord, columns } from "./columns";
import DataTable from "./data-table";
import { Card } from "~/components/ui/card";
import Download02Icon from "~/components/icons/download-02-stroke-rounded";
export default function CCDetail(props: {
  params: { ccId: string; affiliateId: string };
}) {
  const router = useRouter();
  const events = api.events.getByCC.useQuery({ ccId: props.params.ccId });
  const grupo = api.family_groups.get.useQuery({
    family_groupsId: props.params.affiliateId,
  });
  const grupos = props.params.affiliateId;
  const { data: cc } = api.currentAccount.getByFamilyGroup.useQuery({
    familyGroupId: grupos ?? "",
  });
  const lastEvent = cc?.events.reduce((prev, current) => {
    return new Date(prev.createdAt) > new Date(current.createdAt)
      ? prev
      : current;
  });
  const comprobantes = grupo.data?.comprobantes;
  const tableRows: TableRecord[] = [];
  if (events.data) {
    for (const event of events?.data) {
      tableRows.push({
        date: event.createdAt,
        description: event.description,
        amount: event.event_amount,
        comprobanteType: "Nota de credito A",
        comprobanteNumber: "00001-00002546",
        status: "Pendiente",
        iva: 0.21,
      });
    }
  }
  return (
    <LayoutContainer>
      <Title>Movimientos cuenta corriente</Title>
      <h2 className=" font-semibold mb-2">Grupo familiar N° XX</h2>
      <div className="flex gap-3 mt-5 mb-10">
        <Card className="py-4 px-6 w-1/4 grid grid-cols-2 items-center">
          <div className="flex flex-col">
            <p className="text-base font-medium block">SALDO ACTUAL</p>
            <span className="text-[#EB2727] text-2xl font-bold">
              $
              {lastEvent?.current_amount !== undefined
                ? lastEvent.current_amount.toFixed(2)
                : "0.00"}
            </span>
          </div>
        </Card>
        <Card className="py-4 px-9 bg-[#DEF5DD] w-1/4 flex flex-col justify-center">
          <div className="flex flex-col  justify-center">
            <p className="text-sm font-medium block">PRÓXIMO VENCIMIENTO</p>
            <span className="text-[#3E3E3E] font-semibold text-xl">
              10/09/2024
            </span>
          </div>
        </Card>
      </div>
      <DataTable data={tableRows} columns={columns} />
      <div className="flex flex-auto justify-end">
        <Button
          variant="bitcompay"
          className=" text-base px-16 py-6 mt-5 gap-3 text-[#3e3e3e] rounded-full font-medium"
        >
          <Download02Icon />
          Exportar
        </Button>
      </div>
    </LayoutContainer>
  );
}
