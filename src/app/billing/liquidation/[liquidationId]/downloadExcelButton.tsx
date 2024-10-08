"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { computeBase, computeIva } from "~/lib/utils";
import { formatDate } from "~/lib/utils";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import Download02Icon from "~/components/icons/download-02-stroke-rounded";
type DownloadExcelButtonProps = {
  liquidationId: string;
  excelHeaders: string[];
  period: Date | null | undefined;
};
export default function DownloadExcelButton({
  liquidationId,
  excelHeaders,
  period,
}: DownloadExcelButtonProps) {
  async function handleGenerate(
    rows: (string | number | null | undefined)[][]
  ) {
    const excelContent = rows;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelContent);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const excelBuffer = XLSX.write(wb, {
      type: "array",
      bookType: "xlsx",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `pre-liquidación - ${formatDate(period!)}.xlsx`);
  }

  const rows: (string | number)[][] = [[...excelHeaders]];
  const mutation = api.family_groups.getByLiquidationFiltered.useMutation();

  return (
    <div className="flex flex-auto justify-end">
    <Button
      variant="bitcompay"
      className=" text-base px-14 py-4 mt-5 gap-2 text-[#3e3e3e] rounded-full font-medium"
        onClick={async () => {
          alert("Descargando Excel Pre liquidación");
          await handleGenerate(rows);
        }}>
        <Download02Icon className="h-4"/>
      Exportar
    </Button>
    </div>
  );
}
