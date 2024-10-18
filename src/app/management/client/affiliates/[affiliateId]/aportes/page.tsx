"use client";
import { FileText } from "lucide-react";
import { Title } from "~/components/title";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import LayoutContainer from "~/components/layout-container";
import { Button } from "~/components/ui/button";
// import { type TableRecord, columns } from "./columns";
// import DataTable from "./data-table";
import { Card } from "~/components/ui/card";
import Download02Icon from "~/components/icons/download-02-stroke-rounded";
import { RouterOutputs } from "~/trpc/shared";
import { formatCurrency } from "~/app/billing/pre-liquidation/[liquidationId]/detail-sheet";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "dayjs/locale/es";
dayjs.locale("es");
export default function CCDetail(props: {
  params: { ccId: string; affiliateId: string };
}) {
  return (
    <LayoutContainer>
      <Title>Aportes grupo familiar</Title>
    </LayoutContainer>
  );
}
