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
export default function CCDetail(props: {
  params: { ccId: string; affiliateId: string };
}) {
  const router = useRouter();
  const events = api.events.getByCC.useQuery({ ccId: props.params.ccId });
  const grupo = api.family_groups.get.useQuery({
    family_groupsId: props.params.affiliateId,
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
        status:"Pendiente", 
        iva: 0.21,
      });
    }
  }
  return (
    <LayoutContainer>
      <Title>Detalle cuenta corriente</Title>
      <h2 className=" font-semibold mb-2">Movimientos cuenta corriente</h2>
      <DataTable data={tableRows} columns={columns}/>
    </LayoutContainer>
  );
}
