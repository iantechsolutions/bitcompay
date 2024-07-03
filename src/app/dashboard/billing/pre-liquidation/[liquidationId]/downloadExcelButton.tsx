"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "~/components/ui/button";
import { computeBase, computeIva } from "~/lib/utils";
import { formatDate } from "~/lib/utils";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
type DownloadExcelButtonProps = {
  rows: (string | number | null | undefined)[][];
  period: Date | null | undefined;
};
export default function DownloadExcelButton({
  rows,
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
  return (
    <Button
      className="mt-4"
      onClick={async () => {
        alert("Descargando Excel Pre liquidación");
        await handleGenerate(rows);
      }}>
      Descargar Excel Pre liquidación
    </Button>
  );
}
