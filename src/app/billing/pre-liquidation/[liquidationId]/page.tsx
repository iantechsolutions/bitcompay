// falta formatear fecha y hora, usuario
"use server";
import { currentUser } from "@clerk/nextjs/server";
import LayoutContainer from "~/components/layout-container";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";
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
import { type TableRecord, columns } from "./columns";
import { DataTable } from "./data-table";
import { api } from "~/trpc/server";
import dayjs from "dayjs";
import xlsx from "xlsx";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
dayjs.extend(utc);
dayjs.locale("es");

import { clerkClient } from "@clerk/nextjs/server";
import UpdateLiquidationEstadoDialog from "./approve-liquidation-dialog";
import { computeBase, computeIva, toNumberOrZero } from "~/lib/utils";
import DownloadExcelButton from "./downloadExcelButton";
import RejectLiquidationDialog from "./reject-liquidation-dialog";
import { ChevronLeft, CircleX } from "lucide-react";
import { GoBackButton } from "~/components/goback-button";
import { family_groups } from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";

export default async function Home(props: {
  params: { liquidationId: string };
}) {
  const liquidationId = props.params.liquidationId;
  const userActual = await currentUser();

  const companyData = await api.companies.get.query();

  const preliquidation = await api.liquidations.getLite.query({
    id: liquidationId,
  });

  // const eventos = await api.events.list.query();
  // const businessUnit = preliquidation?.bussinessUnits;
  // const user = await clerkClient.users.getUser(
  //   preliquidation?.userCreated ?? "user_2iy8lXXdnoa2f5wHjRh5nj3W0fU"
  // );

  if (!preliquidation) return <Title>Preliquidación no encotrada</Title>;
  const summary = await api.family_groups.getSummaryByLiqId.query({
    liquidationId,
    period: preliquidation?.period ?? undefined,
  });

  // const fg = await api.family_groups.getWithFilteredComprobantes.query({

  // })

  // const allPlan = await api.plans.list.query();
  // const plansOptions = allPlan.map((plan) => ({
  //   value: plan.id,
  //   label: plan.plan_code ?? "plan sin nombre",
  // })) || [{ value: "", label: "" }];
  // const allModos = await api.modos.list.query();
  // const modosOptions = allModos.map((modo) => ({
  //   value: modo?.id,
  //   label: modo?.description ?? "modo sin nombre",
  // })) || [{ value: "", label: "" }];

  const periodo = dayjs.utc(preliquidation?.period).format("MM/YYYY") ?? "-";

  const headers = [
    "NRO. GF",
    "Nombre",
    "CUIL/CUIT",
    "Saldo anterior",
    "Cuota Pura",
    "Bonificacion",
    "Diferencial",
    "Aporte",
    "Interes",
    "SubTotal",
    "IVA",
    "Total",
  ];

  if (preliquidation?.estado.toLowerCase() !== "pendiente") {
    headers.push("Factura");
  }

  // const family_groups = preliquidation.comprobantes.map(
  //   (comprobante) => comprobante.family_group
  // );

  // let fechavenc2 = {dayjs.utc(preliquidation?.comprobantes[0]?.payments[0]?.second_due_date).format("DD/MM/YYYY") ?? "-" }
  // fechavenc2 == {"Invalid Date"} ? "-" : fechavenc2

  return (
    <LayoutContainer>
      <div className="flex flex-row justify-between w-full">
        {/* <GoBackButton url="/billing/pre-liquidation" /> */}
        <Title>Preliquidación</Title>
        {preliquidation?.estado.toLowerCase() === "pendiente" && (
          <>
            <div className="flex flex-row gap-4 mr-8">
              <UpdateLiquidationEstadoDialog
                liquidationId={props.params.liquidationId}
                userId={userActual?.id ? userActual?.id : ""}
              />
              <RejectLiquidationDialog
                liquidationId={props.params.liquidationId}
              />
            </div>
          </>
        )}
      </div>
      <div className="bg-[#f6f6f6] rounded-lg text-xs  min-w-[35rem]">
        <ul className="grid grid-cols-3 whitespace-nowrap gap-x-4 gap-y-6 list-none px-8 py-5">
          <li className="">
            <span className="">RAZÓN SOCIAL</span>
            <br />
            <p className="font-medium text-sm">
              {companyData?.razon_social ?? "-"}
            </p>
          </li>
          <li>
            <span className="">CUIT</span>
            <br />
            <p className="font-medium text-sm">{companyData?.cuit ?? "-"}</p>
          </li>
          <li>
            <span className="">MARCA</span>
            <br />
            <p className="font-medium text-sm">
              {preliquidation?.brand?.name ?? "-"}
            </p>
          </li>
          <li>
            <span className="">PERÍODO</span>
            <br />
            <p className="font-medium text-sm">{periodo}</p>
          </li>
          <li>
            <span className="">N° PRELIQUIDACIÓN</span>
            <br />
            <p className="font-medium text-sm">
              {preliquidation?.number ?? "-"}
            </p>
          </li>
          <li>
            <span className="">FECHA DE PROCESO</span>
            <br />
            <p className="font-medium text-sm">
              {dayjs.utc(preliquidation?.createdAt).format("DD/MM/YYYY hh:mm") ??
                "-"}
            </p>
          </li>
          <li className="">
            <span className="">UNIDAD DE NEGOCIOS</span>
            <br />
            <p className="font-medium text-sm">
              {preliquidation?.bussinessUnits?.description ?? "-"}
            </p>
          </li>
          <li>
            <span className="">FECHA DE EMISIÓN</span>
            <br />
            <p className="font-medium text-sm">
              {dayjs.utc(preliquidation?.createdAt).format("DD/MM/YYYY") ?? "-"}
            </p>
          </li>
          <li>
            <span className="">PDV</span>
            <br />
            <p className="font-medium text-sm">{preliquidation?.pdv ?? "-"}</p>
          </li>
          <li>
            <span className="">1° FECHA DE VENCIMIENTO</span>
            <br />
            <p className="font-medium text-sm">
              {dayjs
                .utc(
                  preliquidation?.comprobantes[0]?.payments[0]?.first_due_date
                )
                .format("DD/MM/YYYY") ?? "-"}
            </p>
          </li>
          <li>
            <span className="">2° FECHA DE VENCIMIENTO</span>
            <br />
            <p className="font-medium text-sm">
              {dayjs
                .utc(
                  preliquidation?.comprobantes[0]?.payments[0]?.second_due_date
                )
                .format("DD/MM/YYYY") ?? "-"}
            </p>
          </li>
          <li>
            <span className="">INTERÉS</span>
            <br />
            <p className="font-medium text-sm">
              {new Intl.NumberFormat("es-AR", {
                style: "percent",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(preliquidation?.interest! / 100) ?? "-"}
            </p>
          </li>
        </ul>
      </div>

      <div className="relative">
        <DataTable
          columns={columns}
          summary={summary}
          maxEventDate={preliquidation.createdAt}
          liquidationId={liquidationId}
        />
        <DownloadExcelButton
          liquidationId={liquidationId}
          period={preliquidation?.period}
          excelHeaders={headers}
        />
      </div>
    </LayoutContainer>
  );
}
