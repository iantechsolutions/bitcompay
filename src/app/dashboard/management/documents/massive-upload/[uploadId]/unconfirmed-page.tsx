"use client";
import LayoutContainer from "~/components/layout-container";
import dayjs from "dayjs";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Title } from "~/components/title";
import { Card } from "~/components/ui/card";
import { FileSpreadsheetIcon } from "lucide-react";
import { RouterOutputs } from "~/trpc/shared";
import { useState } from "react";
import { recHeaders } from "~/server/excel/validator";
import { LargeTable } from "~/components/table";
import { useRouter } from "next/navigation";

// export const maxDuration = 60;

interface unconfirmedPageProps {
  upload: RouterOutputs["excelDeserialization"]["upload"];
}

export default function UnconfirmedPage(props: unconfirmedPageProps) {
  const { upload } = props;
  const [confirmed, setConfirmed] = useState(upload!.confirmed);
  const [data, setData] = useState<
    RouterOutputs["excelDeserialization"]["deserialization"] | null
  >(null);
  const router = useRouter();
  const {
    mutateAsync: confirmData,
    error: dataError,
    isLoading: isDataLoading,
  } = api.excelDeserialization.confirmData.useMutation();

  const {
    mutateAsync: readData,
    error: errorRead,
    isLoading: isReadingLoading,
  } = api.excelDeserialization.deserialization.useMutation();

  async function handleRead() {
    const data = await readData({
      type: "rec",
      id: upload!.id,
    });
    setData(data);
  }
  async function handleConfirm() {
    await confirmData({
      type: "rec",
      uploadId: upload!.id,
    });
    toast.success("Datos subidos correctamente");
    router.push(`./`);
  }

  return (
    <LayoutContainer>
      <Card className="flex items-center gap-3 p-3">
        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-stone-100">
          <FileSpreadsheetIcon />
        </div>
        <div className="">
          <p className="font-medium text-md">{upload!.fileName}</p>
          <p className="font-semibold text-xs">
            subido el{" "}
            {dayjs(upload!.createdAt).format("DD/MM/YYYY [a las] HH:mm:ss")}
          </p>
        </div>
      </Card>

      <div className="flex gap-1">
        <Button onClick={handleRead} disabled={isReadingLoading}>
          Leer archivo
        </Button>
        <Button onClick={handleConfirm} disabled={isDataLoading}>
          Escribir a la base de datos
        </Button>
      </div>
      {errorRead && (
        <pre className="mt-5 overflow-auto rounded-md border border-dashed p-4">
          {errorRead?.data?.cause?.trim() ?? errorRead?.message}
        </pre>
      )}

      {dataError && (
        <pre className="mt-5 overflow-auto rounded-md border border-dashed p-4">
          {dataError?.data?.cause?.trim() ?? dataError?.message}
        </pre>
      )}

      <div className="mt-5">
        {data && <LargeTable rows={data} headers={recHeaders} />}
      </div>
    </LayoutContainer>
  );
}
