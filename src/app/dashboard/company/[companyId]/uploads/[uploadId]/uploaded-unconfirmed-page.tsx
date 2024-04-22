"use client";

import LayoutContainer from "~/components/layout-container";
import UploadedConfirmedPage from "./uploaded-confirmed-page";
import { Title } from "~/components/title";
import type { RouterOutputs } from "~/trpc/shared";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { FileSpreadsheetIcon } from "lucide-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { LargeTable } from "~/components/table";
import { LargeEditableTable } from "~/components/editable-table";
import { toast } from "sonner";
import { asTRPCError } from "~/lib/errors";
import { useCompanyData } from "../../company-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
// import { useReceiveData } from "./upload-provider";

export type UploadedPageProps = {
  upload: NonNullable<RouterOutputs["uploads"]["upload"]>;
};

export default function UploadUnconfirmedPage(props: UploadedPageProps) {
  const [confirmed, setConfirmed] = useState<boolean>(props.upload.confirmed);
  const router = useRouter();

  const { upload } = props;

  const [documentType] = useState<"rec">("rec");

  const company = useCompanyData();

  let fileSizeLabel: React.ReactNode = null;

  if (upload.fileSize < 1000) {
    fileSizeLabel = <span>{upload.fileSize} bytes</span>;
  }

  if (upload.fileSize >= 1000 && upload.fileSize < 1000 * 1000) {
    fileSizeLabel = <span>{(upload.fileSize / 1000).toFixed(1)} KB</span>;
  }

  if (upload.fileSize >= 1000 * 1000) {
    fileSizeLabel = (
      <span>{(upload.fileSize / 1000 / 1000).toFixed(1)} MB</span>
    );
  }

  const {
    mutateAsync: readUploadContents,
    isLoading,
    error: dataError,
  } = api.uploads.readUploadContents.useMutation();

  const { mutateAsync: confirmUpload, isLoading: isLoadingConfirm } =
    api.uploads.confirmUpload.useMutation();

  const { mutateAsync: deleteUpload } = api.uploads.delete.useMutation();

  async function handlerConfirm() {
    if (!data) return;
    if (!documentType) return;
    if (isLoadingConfirm) return;

    try {
      await confirmUpload({ id: upload.id, companyId: company.id });
      toast.success("Documento cargado correctamente");
      setConfirmed(true);
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<
    RouterOutputs["uploads"]["readUploadContents"] | null
  >(null);

  const productsBatchArray: Record<string, unknown>[] = Object.entries(
    data?.batchHead ?? {},
  ).map(([key, value]) => ({
    product: key,
    ...value,
  }));

  const rowsOnly = data?.rowToEdit.map((item) => item.row);
  const colsOnly = data?.rowToEdit.map((item) => item.column);
  const reasonsOnly = data?.rowToEdit.map((item) => item.reason);
  const editRowsBatchArray: Record<string, unknown>[] = Object.entries(
    rowsOnly ?? {},
  ).map(([key, value]) => ({
    product: key,
    ...value,
  }));

  const [editableTableRows, setEditableTableRows] =
    useState<Record<string, unknown>[]>(editRowsBatchArray);
  const handleRowChange = (index: number, row: Record<string, unknown>) => {
    const newRows = [...editableTableRows];
    console.log();
    newRows[index] = row;
    if (data !== null) {
      setData({
        ...data,
        rows: newRows!,
      });
    }
  };

  async function handleDelete() {
    try {
      await deleteUpload({ uploadId: props.upload.id });
      router.back();
    } catch (error) {
      console.log("error");
    }
  }

  async function handleContinue() {
    if (!documentType) return;
    if (isLoading) return;

    try {
      setError(null);
      const data: RouterOutputs["uploads"]["readUploadContents"] | null =
        await readUploadContents({
          id: upload.id,
          type: documentType,
          companyId: company.id,
        });

      if (data) {
        setData(data);
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }

  return (
    <>
      {confirmed ? (
        <UploadedConfirmedPage
          upload={props.upload}
          dataBatch={productsBatchArray}
        />
      ) : (
        <>
          <LayoutContainer>
            <Title>Proceso de carga</Title>

            <Card className="flex items-center gap-3 p-3">
              <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-100">
                <FileSpreadsheetIcon />
              </div>
              <div className="">
                <p className="text-md font-medium">{upload.fileName}</p>
                <p className="text-xs font-semibold">
                  {fileSizeLabel} - subido el{" "}
                  {dayjs(upload.createdAt).format(
                    "DD/MM/YYYY [a las] HH:mm:ss",
                  )}
                </p>
              </div>
            </Card>
            {error && <p className="font-semibold text-red-500">{error}</p>}
            <Button
              className="w-full py-6"
              variant="outline"
              disabled={!documentType || isLoading}
              onClick={handleContinue}
            >
              Leer datos
            </Button>

            {dataError && (
              <pre className="mt-5 overflow-auto rounded-md border border-dashed p-4">
                {dataError.data?.cause?.trim() ?? dataError.message}
              </pre>
            )}

            {data && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cant. Transacciones</TableHead>
                    <TableHead>Recaudado por producto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsBatchArray
                    .filter((row) => row.records_number !== 0)
                    .map((row) => (
                      <TableRow key={row.product as React.Key}>
                        <TableCell className="font-medium">
                          {typeof row.productName === "string"
                            ? row.productName
                            : ""}
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
            )}
            <div className="mt-5">
              <h3>Filas con errores a arreglar</h3>

              {data && (
                <LargeEditableTable
                  rows={editRowsBatchArray}
                  headers={data.headers}
                  height={100}
                  columns={colsOnly}
                  onRowChange={handleRowChange}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete}>
                Cancelar y eliminar
              </Button>

              {data && (
                <Button onClick={handlerConfirm}>
                  Confirmar y escribir a la base de datos
                </Button>
              )}
            </div>
          </LayoutContainer>

          <div className="mt-5">
            {data && <LargeTable rows={data.rows} headers={data.headers} />}
          </div>
        </>
      )}
    </>
  );
}
