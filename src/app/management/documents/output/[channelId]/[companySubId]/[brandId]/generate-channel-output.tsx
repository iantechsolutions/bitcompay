"use client";
import { z } from "zod";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { channel } from "diagnostics_channel";
dayjs.extend(utc);
dayjs.locale("es");
export default function GenerateChannelOutputPage(props: {
  channel: { id: string; name: string };
  company: NonNullable<RouterOutputs["companies"]["getById"]>;
  brand: { id: string; name: string };
  status_batch: Record<string, string | number>[];
  outputFiles: RouterOutputs["iofiles"]["list"];
}) {
  const {
    mutateAsync: generateOutputFile,
    isLoading,
    data,
  } = api.iofiles.generate.useMutation();

  const schema = z.object({
    texto: z.string().max(12),
  });

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [cardType, setCardType] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>("");
  const [disabled, setDisabled] = useState(false);

  const FileNameMap: Record<string, string> = {
    "visa credito": "DEBLIQC ",
    "visa debito": "DEBLIQD ",
    "mastercard credito": "DEBLIMC ",
  };
  let fileNameCard;
  const form = useForm();
  useEffect(() => {
    const key = `${cardBrand} ${cardType}` as keyof typeof FileNameMap;
    fileNameCard = FileNameMap[key];
  }, [cardBrand, cardType]);

  async function handleGenerate() {
    if (!fileName || fileName?.length > 10) {
      setError("no se puede asignar un nombre mayor a 10 caracteres");
      return;
    }
    try {
      schema.parse({ texto: fileName });
      const { company } = props;
      const data = await generateOutputFile({
        channelId: props.channel.id,
        companyId: company.id,
        brandId: props.brand.id,
        fileName: fileName,
        concept: company.concept,
        card_type: cardType ?? null,
        card_brand: cardBrand ?? null,
      });

      if (!data && props.channel.name === "DEBITO AUTOMATICO") {
        return toast.error(
          "No existe número de establecimiento válido para la marca"
        );
      }
      if (!data && props.channel.name.includes("DEBITO DIRECTO CBU")) {
        return toast.error("Error. Existen pagos sin un CBU asociado");
      }
      toast.success("Se ha generado el archivo");
      setError(null);
      setDisabled(true);
    } catch {
      toast.error("Error");
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

      {props.status_batch[0]!.records !== 0 && (
        <>
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
                          ? "$".concat(row.amount_collected.toFixed(2))
                          : ""}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}

          <Dialog>
            <DialogTrigger asChild={true}>
              <Button
                disabled={isLoading || disabled}
                size="lg"
                className="w-full">
                {isLoading && <Loader2Icon className="mr-2 animate-spin" />}
                Generar Archivo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ingresar nombre para el archivo</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className=" items-center gap-4">
                  {props.channel.name !== "DEBITO AUTOMATICO" ? (
                    <>
                      <Label htmlFor="fileName" className="text-right">
                        Nombre del archivo
                      </Label>
                      <Input
                        id="fileName"
                        onChange={handleName}
                        className="col-span-3"
                      />
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="card_brand">Marca de Tarjeta</Label>
                      <Select onValueChange={(value) => setCardBrand(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Marca Tarjeta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="mastercard">MasterCard</SelectItem>
                        </SelectContent>
                      </Select>
                      <Label htmlFor="card_type"> Tipo de Tarjeta</Label>
                      <Select onValueChange={(value) => setCardType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo tarjeta" />
                        </SelectTrigger>
                        <SelectContent>
                          {cardBrand === "visa" ? (
                            <SelectItem value="debito">Debito</SelectItem>
                          ) : null}
                          <SelectItem value="credito">Credito</SelectItem>
                        </SelectContent>
                      </Select>

                      <Form {...form}>
                        <form>
                          <FormField
                            control={form.control}
                            name="presentation_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="presentation_date">
                                  Fecha de presentacion
                                </FormLabel>
                                <Popover open={open} onOpenChange={setOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-[240px] pl-3 text-left font-normal",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}>
                                        <p>
                                          {field.value
                                            ? dayjs
                                                .utc(field.value)
                                                .format("D [de] MMMM [de] YYYY")
                                            : "Escoga una fecha"}
                                        </p>
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start">
                                    <Calendar
                                      mode="single"
                                      selected={
                                        field.value
                                          ? new Date(field.value)
                                          : undefined
                                      }
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setOpen(false); // Cierra el popover después de seleccionar la fecha
                                      }}
                                      disabled={(date: Date) =>
                                        date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>

                      <Label htmlFor="fileName" className="text-left">
                        Nombre del archivo
                      </Label>
                      <Input
                        id="fileName"
                        onChange={handleName}
                        className="col-span-3"
                      />
                    </div>
                  )}
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

          {data !== undefined && (
            <div className="mt-5">
              <Title>Resultado</Title>
              {dataDataURL && (
                <a
                  href={dataDataURL}
                  download={`${fileName ?? fileNameCard ?? " "}.txt`}>
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
                    {error}
                  </p>
                )}
              </pre>
            </div>
          )}
        </>
      )}
      {props.status_batch[0]!.records === 0 && (
        <div>
          <h3 className="text-red-600">
            No hay transacciones para generar archivo
          </h3>
        </div>
      )}
    </>
  );
}
