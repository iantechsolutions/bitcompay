// falta formatear fecha y hora, usuario
"use server";
import { currentUser } from "@clerk/nextjs/server";
import LayoutContainer from "~/components/layout-container";

// import {
//   Table,
//   TableRow,
//   TableBody,
//   TableHead,
//   TableHeader,
// } from "~/components/ui/tablePreliq";
import TableRowContainer from "./table-row";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import dayjs from "dayjs";
import xlsx from "xlsx";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
dayjs.extend(utc);
dayjs.locale("es");
import { RouterOutputs } from "~/trpc/shared";
import { clerkClient } from "@clerk/nextjs/server";
import UpdateLiquidationEstadoDialog from "./approve-liquidation-dialog";
import { computeBase, computeIva } from "~/lib/utils";
import DownloadExcelButton from "./downloadExcelButton";

export default async function Home(props: {
  params: { liquidationId: string };
}) {
  const userActual = await currentUser();
  const preliquidation = await api.liquidations.get.query({
    id: props.params.liquidationId,
  });
  console.log("preliquidation");
  console.log(preliquidation);
  const user = await clerkClient.users.getUser(
    preliquidation?.userCreated ?? ""
  );
  // if (!preliquidation) return <Title>Preliquidacion no encotrada</Title>;
  const facturas = preliquidation?.facturas;
  const periodo =
    dayjs.utc(preliquidation?.period).format("MMMM [de] YYYY") ?? "-";
  const headers = [
    "Id. GF",
    "Nombre (Resp. Pago)",
    "DNI",
    "CUIL/CUIT (Resp. Pago)",
    "Saldo Cta. Cte.",
    "Cuota",
    "Bonificacion",
    "Diferencial",
    "Aportes",
    "Interes",
    "SubTotal",
    "IVA",
    "Total",
  ];
  const rowsPromise =
    facturas?.map(async (factura) => {
      if (!factura) return [];
      const billResponsible = factura?.family_group?.integrants[0];

      const lastEvent = await api.events.getLastByDateAndCC.query({
        ccId: factura?.family_group?.cc?.id!,
        date: factura?.liquidations?.createdAt ?? new Date(),
      });

      const total = parseFloat(factura?.importe.toFixed(2));
      return [
        factura?.family_group?.numericalId ?? "",
        billResponsible?.name ?? "",
        billResponsible?.id_number ?? "",
        billResponsible?.fiscal_id_number ?? "",
        isNaN(factura.items?.abono!) ? " " : factura.items?.abono,
        isNaN(factura.items?.bonificacion!) ? " " : factura.items?.bonificacion,
        isNaN(factura.items?.differential_amount!)
          ? " "
          : factura.items?.differential_amount,
        isNaN(factura.items?.contribution!) ? " " : factura.items?.contribution,
        isNaN(factura.items?.interest!) ? " " : factura.items?.interest,
        isNaN(computeBase(total, parseFloat(factura?.iva)))
          ? " "
          : computeBase(total, parseFloat(factura?.iva)),
        isNaN(computeIva(total, parseFloat(factura?.iva)))
          ? " "
          : computeIva(total, parseFloat(factura?.iva)),
        isNaN(total) ? " " : total,
      ];
    }) || [];
  const rows = await Promise.all(rowsPromise);
  rows.unshift(headers);
  return (
    <LayoutContainer>
      <div className="grid grid-cols-3 gap-x-2 gap-y-2">
        <p className="opacity-70">
          <span className="font-bold opacity-100">Razon social: </span>
          {preliquidation?.razon_social ?? "-"}
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Periodo: </span>
          {periodo}
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Hora: </span>
          {dayjs.utc(new Date()).format("HH:mm") ?? "-"}
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">CUIT: </span>
          {preliquidation?.cuit ?? "-"}
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Nro. Pre-liq: </span>
          {preliquidation?.number ?? "-"}
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Unidad de negocio: </span>
          {preliquidation?.bussinessUnits?.description ?? "-"}
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">PDV: </span>
          {preliquidation?.pdv?.toString() ?? "-"}
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Fecha: </span>
          {dayjs.utc(preliquidation?.createdAt).format("DD/MM/YYYY") ?? "-"}
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Usuario: </span>
          {user?.emailAddresses.at(0)?.emailAddress ?? "-"}
        </p>
      </div>
      <div>
        <Table className="border-separate  border-spacing-x-0 border-spacing-y-2">
          <TableHeader className="overflow-hidden">
            <TableRow className="bg-[#79edd6]">
              <TableHead className="text-gray-800 rounded-l-md border-r-[1.5px] border-[#4af0d4]">
                Id. GF
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Nombre (Resp. Pago){" "}
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                DNI
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                CUIL/CUIT (Resp. Pago){" "}
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Saldo Cta. Cte.{" "}
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Cuota
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Bonificacion
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Diferencial
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Aportes
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Interes
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Sub total
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                IVA
              </TableHead>
              {preliquidation?.estado !== "pendiente" ? (
                <>
                  <TableHead
                    className="text-gray-800
               rounded-r-md overflow-hidden"
                  >
                    Total
                  </TableHead>

                  <TableHead
                    className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
                  >
                    Factura
                  </TableHead>
                </>
              ) : (
                <TableHead
                  className="text-gray-800
               rounded-r-md overflow-hidden"
                >
                  Total
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {facturas?.map((factura: any) => (
              <TableRowContainer
                key={factura.id}
                factura={factura}
                preliquidation={preliquidation}
                periodo={periodo}
              />
            ))}
          </TableBody>
        </Table>
        <br />
        {preliquidation?.estado === "pendiente" && (
          <UpdateLiquidationEstadoDialog
            liquidationId={props.params.liquidationId}
            userId={userActual?.id ? userActual?.id : ""}
          />
        )}
        <br />
        <DownloadExcelButton rows={rows} period={preliquidation?.period} />
      </div>
    </LayoutContainer>
  );
}
