"use client";
import LayoutContainer from "~/components/layout-container";
import dayjs from "dayjs";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Title } from "~/components/title";
import { Card } from "~/components/ui/card";
import { FileSpreadsheetIcon } from "lucide-react";
import { RouterOutputs } from "~/trpc/shared";
import { useState } from "react";
interface unconfirmedPageProps {
  upload: RouterOutputs["excelDeserialization"]["upload"];
  companyId: string;
}

export default function UnconfirmedPage(props: unconfirmedPageProps) {
  const { upload, companyId } = props;
  const [confirmed, setConfirmed] = useState(upload!.confirmed);
  const { mutateAsync: confirmData, error: dataError } =
    api.excelDeserialization.confirmData.useMutation();

  const { mutateAsync: readData, error: errorRead } =
    api.excelDeserialization.deserialization.useMutation();

  function handleRead() {
    readData({
      type: "rec",
      id: upload!.id,
      companyId: companyId,
    });
  }
  function handleConfirm() {
    confirmData({
      type: "rec",
      uploadId: upload!.id,
      companyId: companyId,
    });
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
        <Button onClick={handleRead}>Leer archivo</Button>
        <Button onClick={handleConfirm}>Escribir a la base de datos</Button>
      </div>
      {errorRead && <div>{errorRead.message}</div>}
    </LayoutContainer>
  );
}
