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
import { ChevronLeft, CircleX } from "lucide-react";
export default async function Home(props: {
  params: { liquidationId: string };
}) {
  const userActual = await currentUser();
  const companyData = await api.companies.get.query();
  const preliquidation = await api.liquidations.get.query({
    id: props.params.liquidationId,
  });

  const user = await clerkClient.users.getUser(
    preliquidation?.userCreated ?? ""
  );
  // if (!preliquidation) return <Title>Preliquidacion no encotrada</Title>;
  const familyGroups = await api.family_groups.getByLiquidation.query({
    liquidationId: props.params.liquidationId,
  });
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
  const summary = {
    "Cuota Planes": 175517.82,
    Bonificación: 175517.82,
    Diferencial: 175517.82,
    Aportes: 175517.82,
    Interés: 175517.82,
  };
  // const rowsPromise =
  //   facturas?.map(async (factura) => {
  //     if (!factura) return [];
  //     const billResponsible = factura?.family_group?.integrants[0];

  //     const lastEvent = await api.events.getLastByDateAndCC.query({
  //       ccId: factura?.family_group?.cc?.id!,
  //       date: factura?.liquidations?.createdAt ?? new Date(),
  //     });

  //     const total = parseFloat(factura?.importe.toFixed(2));
  //     return [
  //       factura?.family_group?.numericalId ?? "",
  //       billResponsible?.name ?? "",
  //       billResponsible?.id_number ?? "",
  //       billResponsible?.fiscal_id_number ?? "",
  //       isNaN(factura.items?.abono!) ? " " : factura.items?.abono,
  //       isNaN(factura.items?.bonificacion!)
  //         ? " "
  //         : factura.items?.bonificacion?.toString(),
  //       isNaN(factura.items?.differential_amount!)
  //         ? " "
  //         : factura.items?.differential_amount,
  //       isNaN(factura.items?.contribution!) ? " " : factura.items?.contribution,
  //       isNaN(factura.items?.interest!) ? " " : factura.items?.interest,
  //       isNaN(computeBase(total, parseFloat(factura?.iva)))
  //         ? " "
  //         : computeBase(total, parseFloat(factura?.iva)),
  //       isNaN(computeIva(total, parseFloat(factura?.iva)))
  //         ? " "
  //         : computeIva(total, parseFloat(factura?.iva)),
  //       isNaN(total) ? " " : total,
  //     ];
  //   }) || [];
  // const rows = await Promise.all(rowsPromise);
  // rows.unshift(headers);
  return (
    <LayoutContainer>
      <div className="flex flex-row justify-between w-full">
        {preliquidation?.estado === "pendiente" && (
          <>
            <div className="opacity-50 flex flex-row items-center">
              {" "}
              <ChevronLeft className="mr-1 h-4 w-auto" />
              <p className="font-medium ">VOLVER</p>
            </div>
            <div className="flex flex-row gap-1">
              <UpdateLiquidationEstadoDialog
                liquidationId={props.params.liquidationId}
                userId={userActual?.id ? userActual?.id : ""}
              />
              <Button className=" h-7 bg-[#c2c0c0] hover:bg-[#7e7c7c] text-[#686767]  text-xs rounded-2xl py-0 px-6">
                Rechazar <CircleX className="h-4 w-auto ml-2" />{" "}
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-2 ml-3 text-base opacity-50">
        <ul className="list-disc">
          <li>
            <span className="font-bold "> CUIT: </span>
            {companyData?.cuit ?? "-"}
          </li>
          <li className="opacity-70">
            <span className="font-bold ">Razon social: </span>
            {companyData?.razon_social ?? "-"}
          </li>
        </ul>
        <ul className="list-disc">
          <li>
            <span className="font-bold ">Gerenciador</span>{" "}
          </li>
          <li>
            <span className="font-bold ">Periodo: </span>
            {periodo}
          </li>
        </ul>
        <ul className="list-disc">
          <li>
            <span className="font-bold opacity-100">Nro. Pre-liq: </span>
            {preliquidation?.number ?? "-"}
          </li>
          <li>
            <span className="font-bold opacity-100">Fecha: </span>
            {dayjs.utc(preliquidation?.createdAt).format("DD/MM/YYYY") ?? "-"}
          </li>
        </ul>
      </div>
      <div className="bg-[#ecf7f5] flex flex-row justify-evenly gap-2 w-full">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key}>
            <p className="font-medium">{key}</p>
            <p className="text-[#4af0d4] font-bold text-lg">$ {value}</p>
          </div>
        ))}
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
            {familyGroups?.map((familyGroup) => (
              <TableRowContainer
                key={familyGroup?.id}
                family_group={familyGroup}
                preliquidation={preliquidation}
                periodo={periodo}
              />
            ))}
          </TableBody>
        </Table>
        <br />

        <br />
        {/* <DownloadExcelButton rows={rows} period={preliquidation?.period} /> */}
      </div>
    </LayoutContainer>
  );
}
