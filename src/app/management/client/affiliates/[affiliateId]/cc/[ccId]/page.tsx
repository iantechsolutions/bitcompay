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
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import TableToolbar from "~/components/tanstack/table-toolbar";
import { table } from "node:console";
import { DataTable } from "~/app/management/client/health_insurances/data-table";
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
  function handleGenerate(rows: any) {
    throw new Error("Function not implemented.");
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
   
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F7F7F7] hover:bg-[#F7F7F7] rounded-lg ">
            <TableHead className="w-[4rem]">Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Importe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.data?.map((event) => (
            <TableRow
              key={event.id}
              className=" border-b-2 border-gray-200 border-x-0 text-center  "
            >
              <TableCell className="w-[15rem]">
                {dayjs(event?.createdAt).format("YYYY-MM-DD HH:mm")}
              </TableCell>
              <TableCell>{event?.description}</TableCell>
              <TableCell>{event?.type}</TableCell>
              <TableCell>${event?.event_amount * -1}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <h2 className="font-semibold mb-2">Comprobantes</h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F7F7F7] hover:bg-[#F7F7F7] rounded-lg ">
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comprobantes
            ?.filter((x) => x.estado != "generada" && x.estado != "anulada")
            .map((comprobante) => (
              <TableRow
                key={comprobante.id}
                className="border-b-2 border-gray-200 border-x-0 text-center  "
              >
                <TableCell>
                  {dayjs(comprobante?.createdAt).format("YYYY-MM-DD hh:mm")}
                </TableCell>
                <TableCell>{comprobante?.tipoComprobante}</TableCell>
                <TableCell>${comprobante?.importe}</TableCell>
                <TableCell>{comprobante?.estado}</TableCell>
                <TableCell className="flex justify-center">
                  <Button
                    disabled={!comprobante?.billLink}
                    variant="ghost"
                    onClick={() => {
                      !comprobante?.billLink
                        ? alert("No hay link")
                        : window.open(comprobante?.billLink);
                      // : router.push(${comprobante?.billLink});
                    }}
                  >
                    <FileText
                    // className="cursor-pointer"
                    />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <div className="flex flex-auto justify-end">
    <Button
      variant="bitcompay"
      className=" text-base px-16 py-6 mt-5 gap-3 text-[#3e3e3e] rounded-full font-medium"
      // onClick={async () => {
      //   alert("Exportando");
      //   handleGenerate(rows);
      // }}
    >
      <Download02Icon />
      Exportar
    </Button>
    </div>
    </LayoutContainer>
  );
}

