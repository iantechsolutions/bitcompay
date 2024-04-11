"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import dayjs from "dayjs";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import { useState } from "react";

export default function GenerateChannelOutputPage(props: {
  channel: NonNullable<RouterOutputs["channels"]["get"]>;
  company: NonNullable<RouterOutputs["companies"]["get"]>;
}) {
  const {
    mutateAsync: generateInputFile,
    isLoading,
    // isSuccess,
    // error,
    data,
  } = api.iofiles.generate.useMutation();

  const [fileName, setFileName] = useState("Com.Rur.Cuot");

  async function handleGenerate() {
    const { company } = props;
    await generateInputFile({
      channelId: props.channel.id,
      companyName: company.name,
      fileName: fileName,
      concept: company.concept,
    });
  }

  const dateYYYYMMDD = dayjs().format("YYYY-MM-DD");

  const dataDataURL = data
    ? `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`
    : null;

  return (
    <>
      <Title>
        {props.company.name} {props.channel?.name}: Generar entrada
      </Title>

      <Dialog>
        <DialogTrigger asChild>
          <Button disabled={isLoading} size="lg" className="w-full">
            {isLoading && <Loader2Icon className="mr-2 animate-spin" />}
            Generar Archivo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ingresar nombre para el archivo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileName" className="text-right">
                Nombre del archivo
              </Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} onClick={handleGenerate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              generar archivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {data != undefined && (
        <div className="mt-5">
          <Title>Resultado</Title>
          {dataDataURL && (
            <a href={dataDataURL} download={`entrada-${dateYYYYMMDD}.txt`}>
              <Button size="lg">
                <DownloadIcon className="mr-2" />
                Descargar archivo
              </Button>
            </a>
          )}
          <pre className="mt-5 overflow-auto rounded-md border border-dashed p-4">
            {data}
            {!data && (
              <p className="my-10 text-center text-sm text-stone-500">
                No se generó nada
              </p>
            )}
          </pre>
        </div>
      )}
    </>
  );
}
