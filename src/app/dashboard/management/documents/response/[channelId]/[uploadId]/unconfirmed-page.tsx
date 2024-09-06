"use client";

import dayjs from "dayjs";
import { FileSpreadsheetIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { LargeTable } from "~/components/table";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { asTRPCError } from "~/lib/errors";
import { db } from "~/server/db";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";

export type UploadedPageProps = {
  upload: NonNullable<RouterOutputs["uploads"]["responseUpload"]>;
  channel: NonNullable<RouterOutputs["channels"]["get"]>;
};

export default function ResponseUnconfirmedPage(props: UploadedPageProps) {
  const router = useRouter();

  const { upload } = props;
  const { mutateAsync: deleteUpload } = api.uploads.delete.useMutation();

  const [documentType] = useState<"txt">("txt");

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
    mutateAsync: readResponseUploadContents,
    isLoading,
    error: dataError,
  } = api.uploads.readResponseUploadContents.useMutation();
  const { mutateAsync: confirmResponseUpload, isLoading: isLoadingConfirm } =
    api.uploads.confirmResponseUpload.useMutation();
  const { data: statuses } = api.status.list.useQuery();
  const statusMap = new Map();
  statuses?.forEach((status) => {
    statusMap.set(status.id, status.description);
  });

  async function handlerConfirm() {
    if (!data) {
      return;
    }
    if (!documentType) {
      return;
    }
    if (isLoadingConfirm) {
      return;
    }

    try {
      await confirmResponseUpload({
        uploadId: upload.id,
        // companyId: "",
        // brandId: 0,
        channelName: props.channel!.name,
      });
      toast.success("Documento cargado correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<
    RouterOutputs["uploads"]["readResponseUploadContents"] | null
  >(null);

  async function handleContinue() {
    if (!documentType) {
      return;
    }
    if (isLoading) {
      return;
    }

    try {
      setError(null);
      const data = await readResponseUploadContents({
        uploadId: upload.id,
        type: documentType,
        channelName: props.channel.name,
      });
      const TableRows = data.records.map((record) => {
        return {
          ...record,
          statusId: statusMap.get(record.statusId) as string,
        };
      });
      data.records = TableRows;
      if (data) {
        setData(data);
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }

  async function handleDelete() {
    try {
      await deleteUpload({ uploadId: props.upload!.id });
      router.back();
    } catch (_error) {}
  }

  return (
    <>
      <LayoutContainer>
        <Title>Proceso de carga</Title>

        <Card className="flex items-center gap-3 p-3">
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-100">
            <FileSpreadsheetIcon />
          </div>
          <div className="">
            <p className="font-medium text-md">{upload.fileName}</p>
            <p className="font-semibold text-xs">
              {fileSizeLabel} - subido el{" "}
              {dayjs(upload.createdAt).format("DD/MM/YYYY [a las] HH:mm:ss")}
            </p>
          </div>
        </Card>
        {error && <p className="font-semibold text-red-500">{error}</p>}
        <Button
          className="w-full py-6"
          variant="outline"
          disabled={!documentType || isLoading}
          onClick={handleContinue}>
          Leer datos
        </Button>

        {dataError && (
          <pre className="mt-5 overflow-auto rounded-md border border-dashed p-4">
            {dataError.data?.cause?.trim() ?? dataError.message}
          </pre>
        )}

        <div className="flex gap-4">
          <Button onClick={handleDelete} variant="destructive">
            Cancelar y eliminar
          </Button>
          {data && (
            <Button onClick={handlerConfirm}>
              Confirmar y escribir a la base de datos
            </Button>
          )}
        </div>
        <div className="mt-5">
          {data && <LargeTable rows={data.records} headers={data.header} />}
        </div>
      </LayoutContainer>
    </>
  );
}
