"use client";
import { CircleX, PlusCircle, PlusCircleIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";

import { Button } from "~/components/ui/button";
dayjs.extend(utc);
dayjs.locale("es");

export default function SelectPercentDialog() {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState("");
  const [validity_date, setValidity_date] = useState<Date>();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Actualizar porcentualmente</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Actualizar porcentualmente precio de plan</DialogTitle>
          </DialogHeader>
          <div>
            <Label>2da Fecha de vencimiento</Label>
            <br />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] border-green-300 pl-3 text-left font-normal focus-visible:ring-green-400",
                    !validity_date && "text-muted-foreground"
                  )}
                >
                  <p>
                    {validity_date ? (
                      dayjs(validity_date).format("D [de] MMMM [de] YYYY")
                    ) : (
                      <span>Seleccione una fecha</span>
                    )}
                  </p>
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={validity_date ? validity_date : undefined}
                  onSelect={(e) => setValidity_date(e)}
                  disabled={(date: Date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="number">Porcentaje de aumento</Label>
            <Input
              id="number"
              placeholder="Ej: 30%"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
