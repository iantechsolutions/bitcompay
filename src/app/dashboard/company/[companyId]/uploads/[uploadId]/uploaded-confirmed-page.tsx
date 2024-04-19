"use client";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import type { RouterOutputs } from "~/trpc/shared";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
export type UploadedPageProps = {
  upload: NonNullable<RouterOutputs["uploads"]["upload"]>;
  dataBatch?: Record<string, unknown>[] | undefined;
};

export default function UploadedConfirmedPage(props: UploadedPageProps) {
  const { confirmedAt, fileName } = props.upload;
  const { dataBatch } = props;
  const pdfRef = useRef<HTMLDivElement>(null);
  console.log(confirmedAt, fileName, dataBatch);

  async function downloadPDF() {
    try {
      const input = pdfRef.current;
      if (!input) {
        throw new Error("El elemento pdfRef.current es null");
      }
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4", true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio,
      );
      pdf.save("comprobante de subida");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  }

  if (!dataBatch) {
    throw new Error("no esta definido cabeza de lote");
  }

  return (
    <LayoutContainer>
      <Title>Carga de archivo finalizada</Title>
      <Button size="lg" className="w-full" onClick={downloadPDF}>
        Descargar Comprobante de salida
      </Button>
      <div ref={pdfRef} className="p-16">
        <h2>Comprobante de subida</h2>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row">
            <img
              src="https://utfs.io/f/761a1f9b-564b-4690-8868-e18d666b80f3-mtnazc.png"
              className="p-r-4"
              alt="logo"
            />
            <p className="relative top-2 text-4xl font-bold ">Bitcom</p>
            <p className="relative top-2 text-4xl">Pay</p>
          </div>
          <div className="flex flex-col">
            <p className="text-ml font-semibold">{fileName}</p>
            <p className="text-ml font-semibold">
              cargado el{" "}
              {dayjs(confirmedAt).format("DD/MM/YYYY [a las] HH:mm:ss")}
            </p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cant. Transacciones</TableHead>
              <TableHead>Recaudado por producto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataBatch
              .filter((row) => row.records_number !== 0)
              .map((row) => (
                <TableRow key={row.product as React.Key}>
                  <TableCell className="font-medium">
                    {typeof row.productName === "string" ? row.productName : ""}
                  </TableCell>
                  <TableCell>
                    {typeof row.records_number === "number"
                      ? row.records_number
                      : ""}
                  </TableCell>
                  <TableCell>
                    {typeof row.amount_collected === "number"
                      ? row.amount_collected
                      : ""}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </LayoutContainer>
  );
}
