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
export default function CCDetail(props: {
  params: { ccId: string; healthInsuranceId: string };
}) {
  const router = useRouter();
  const events = api.events.getByCC.useQuery({ ccId: props.params.ccId });
  const { data: healthInsurance } =
    api.healthInsurances.getWithComprobantes.useQuery({
      healthInsuranceId: props.params.healthInsuranceId,
    });
  const comprobantes = healthInsurance?.comprobantes;
  return (
    <LayoutContainer>
      <Title>Detalle cuanta corriente</Title>
      <h2 className=" font-semibold mb-2">Movimientos cuenta corriente</h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#71EBD4] hover:bg-[#71EBD4] rounded-lg ">
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
              className=" border-b-2 border-gray-200 border-x-0 text-center text-[#909090]"
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
          <TableRow className="bg-[#71EBD4] hover:bg-[#71EBD4] rounded-lg ">
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comprobantes?.map((comprobante) => (
            <TableRow
              key={comprobante.id}
              className="border-b-2 border-gray-200 border-x-0 text-center text-[#909090]"
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
                    // : router.push(`${comprobante?.billLink}`);
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
    </LayoutContainer>
  );
}
