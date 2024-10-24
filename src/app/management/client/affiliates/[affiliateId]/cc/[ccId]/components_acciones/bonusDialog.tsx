"use client";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { PlusCircleIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { DialogHeader } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";

interface BonusDialogProps {
  grupo?: RouterOutputs["family_groups"]["get"];
}

export default function BonusDialog({ grupo }: BonusDialogProps) {
  const bonus = grupo?.bonus[0];
  const [open, setOpen] = useState(false);
  const [percentage, setPercentage] = useState<number>(
    bonus ? Number(bonus.amount) * 100 : 0
  );
  const [fromDate, setFromDate] = useState<Date | undefined>(
    bonus?.from ?? undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    bonus?.to ?? undefined
  );
  const [razon, setRazon] = useState(bonus?.reason || "");

  // Estado para controlar la apertura de los calendarios
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  const { mutateAsync: createBonus, isLoading: isCreating } =
    api.bonuses.create.useMutation();
  const { mutateAsync: editBonus, isLoading: isEditing } =
    api.bonuses.change.useMutation();
  const isLoading = isCreating || isEditing;

  useEffect(() => {
    if (bonus) {
      setPercentage(Number(bonus.amount) * 100);
      setFromDate(bonus.from ?? undefined);
      setToDate(bonus.to ?? undefined);
      setRazon(bonus.reason ?? "");
    }
  }, [bonus]);

  const validateFields = useCallback(() => {
    const errors: string[] = [];
    if (!percentage) errors.push("Porcentaje");
    if (!fromDate) errors.push("Fecha desde");
    if (!toDate) errors.push("Fecha hasta");
    if (!razon) errors.push("Razón");
    return errors;
  }, [percentage, fromDate, toDate, razon]);

  const handleError = (error: unknown) => {
    const trpcError = asTRPCError(error);
    if (trpcError) {
      toast.error(trpcError.message);
    }
  };

  const addBonus = async () => {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
    }

    const amount = (percentage / 100).toString();
    const duration =
      Math.abs((toDate?.getTime() ?? 0) - (fromDate?.getTime() ?? 0)) /
      (1000 * 60 * 60 * 24);

    const bonusData = {
      amount,
      duration: duration.toString(),
      reason: razon,
      from: fromDate,
      to: toDate,
      family_group_id: grupo?.id,
      validationDate: new Date(),
      appliedUser: "",
      approverUser: "",
    };

    try {
      if (!bonus) {
        await createBonus(bonusData);
        toast.success("Bonus agregado");
      } else {
        await editBonus({ ...bonusData, id: bonus.id });
        toast.success("Bonus editado");
      }
      setOpen(false);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-current text-sm shadow-md place-items-center"
          variant="bitcompay">
          <PlusCircleIcon className="h-4 mr-1 stroke-1" />
          Bonus
        </Button>
      </DialogTrigger>
      <DialogContent className="absolute bg-white px-4 py-2 z-10 shadow-md rounded-md top-10 right-[-1px]">
        <DialogHeader className="flex bg-white py-2 z-10">
          <h2 className="text-lg font-semibold whitespace-nowrap p-2">
            Agregar bonus
          </h2>
          <div className="flex flex-col gap-4 bg-white z-10 p-2">
            <div>
              <Label htmlFor="percentage">Porcentaje %</Label>
              <Input
                id="percentage"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                placeholder="..."
                type="number"
              />
            </div>
            <div>
              <Label htmlFor="razon">Razón</Label>
              <Input
                id="razon"
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
                placeholder="..."
              />
            </div>
            <div className="w-full flex flex-row gap-2 py-4 text-gray-500 justify-start">
              <div className="w-1/2 pr-2">
                <Label className="text-xs">Fecha desde</Label>
                <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "text-left flex justify-between font-medium w-full border-b text-[#3E3E3E] bg-background rounded-none pr-0 pl-0",
                        !fromDate && "text-muted-foreground"
                      )}>
                      {fromDate ? (
                        format(fromDate, "PPP")
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={(date) => {
                        setFromDate(date);
                        setIsFromDateOpen(false); // Cerrar el calendario al seleccionar la fecha
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-1/2 pl-2">
                <Label className="text-xs">Fecha hasta</Label>
                <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "text-left flex justify-between font-medium w-full border-b text-[#3E3E3E] bg-background rounded-none pr-0 pl-0",
                        !toDate && "text-muted-foreground"
                      )}>
                      {toDate ? (
                        format(toDate, "PPP")
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={(date) => {
                        setToDate(date);
                        setIsToDateOpen(false); // Cerrar el calendario al seleccionar la fecha
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setOpen(false)}
                className="bg-[#F7F7F7] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-xs rounded-full py-1 px-5">
                Cancelar
              </Button>
              <Button
                className="text-current text-sm"
                variant="bitcompay"
                onClick={addBonus}
                disabled={isLoading}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
