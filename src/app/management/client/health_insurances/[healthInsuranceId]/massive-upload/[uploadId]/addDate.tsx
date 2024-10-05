"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import { cn } from "~/lib/utils";
import dayjs from "dayjs";
import { setDate } from "date-fns";

export default function AddDate({
  onDateSelected,
}: {
  onDateSelected: (fecha: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openDate, setOpenDate] = useState(false);

  const [fecha, setFecha] = useState<Date>(new Date());

  async function Save() {
    console.log(fecha);
    setOpen(false);
  }
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Agregar periodo</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild={true}></DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ingresar nombre para el archivo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="items-center gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="presentation_date">Fecha de presentación</Label>
                <Popover open={openDate} onOpenChange={setOpenDate}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        fecha && "text-muted-foreground"
                      )}>
                      <p>
                        {fecha
                          ? dayjs.utc(fecha).format("D [de] MMMM [de] YYYY")
                          : "Escoga una fecha"}
                      </p>
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fecha ? new Date(fecha) : undefined}
                      onSelect={(date) => {
                        setFecha(date ?? new Date());
                        setOpenDate(false); // Cierra el popover después de seleccionar la fecha
                      }}
                      disabled={(date: Date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => Save()}>
              Guardar fecha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
