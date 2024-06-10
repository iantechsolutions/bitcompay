"use client";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { DialogClose } from "@radix-ui/react-dialog";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
export default function GenerateChannelOutputPage(props: {
  channel: { id: string; name: string };
  company: NonNullable<RouterOutputs["companies"]["get"]>;
  brand: { id: string; name: string };
  status_batch: Record<string, string | number>[];
  outputFiles: RouterOutputs["iofiles"]["list"];
}) {
  const {
    mutateAsync: generateInputFile,
    isLoading,
    // isSuccess,
    // error,
    data,
  } = api.iofiles.generate.useMutation();

  const schema = z.object({
    texto: z.string().max(12),
  });

  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  async function handleGenerate() {
    try {
      schema.parse({ texto: fileName });
      const { company } = props;
      await generateInputFile({
        channelId: props.channel.id,
        companyId: company.id,
        brandId: props.brand.id,
        fileName: fileName,
        concept: company.concept,
      });

      // Limpiar los errores
      setError(null);
      // desabilitar el boton
      setDisabled(true);
    } catch (_error) {
      // Si hay errores de validación, mostrarlos al usuario
      setError("no se puede asignar un nombre mayor a 10 caracteres");
    }
  }

  function handleName(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setFileName(value);
    try {
      schema.parse({ texto: value });
      setError(null);
    } catch (_err) {
      setError("ingresar un nombre menor a 10 caracteres");
    }
  }

  const dataDataURL = data
    ? `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`
    : null;

  return (
    <>
      <div className="flex font-semibold text-sm opacity-80">
        {props.channel.name}
        <ChevronRight />
        {props.company.name}
        <ChevronRight />
        {props.brand.name}
      </div>
      <Title>Generar entrada</Title>
      {props.status_batch[0]!.records !== 0 && (
        <Table className="mb-5 w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Estado transaccion</TableHead>
              <TableHead>Cant. Transacciones</TableHead>
              <TableHead>Recaudacion </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.status_batch
              .filter((row) => row.records !== 0)
              .map((row) => (
                <TableRow key={row.product as React.Key}>
                  <TableCell className="font-medium">
                    {typeof row.status === "string" ? row.status : ""}
                  </TableCell>
                  <TableCell>
                    {typeof row.records === "number" ? row.records : ""}
                  </TableCell>
                  <TableCell>
                    {typeof row.amount_collected === "number"
                      ? "$".concat(row.amount_collected.toString())
                      : ""}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}

      <Dialog>
        <DialogTrigger asChild={true}>
          <Button disabled={isLoading || disabled} size="lg" className="w-full">
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
                onChange={handleName}
                className="col-span-3"
              />
              {error && (
                <span className="w-full text-red-600 text-xs">{error}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button type="button" onClick={handleGenerate}>
                generar archivo
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {props.outputFiles.length > 0 && (
        <div className="mt-3">
          <Title>Archivos generados</Title>
          {props.outputFiles.map((file, i) => (
            <a key={`${file.fileUrl} ${i}`} href={file.fileUrl}>
              {file.fileName}
            </a>
          ))}
        </div>
      )}

      {data !== undefined && (
        <div className="mt-5">
          <Title>Resultado</Title>
          {dataDataURL && (
            <a href={dataDataURL} download={`${fileName}.txt`}>
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
