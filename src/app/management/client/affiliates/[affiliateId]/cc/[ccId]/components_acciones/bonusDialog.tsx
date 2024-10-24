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
          variant={"bitcompay"}>
          <CirclePlus className="p-0 h-4 stroke-1" />
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
              <label htmlFor="group">Grupo Familiar</label>
              <Input
                id="group"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="..."
              />
            </div>
            <div>
              <label htmlFor="percentage">Porcentaje %</label>
              <div className="z-10">
                <Input
                  id="percentage"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="..."
                  type="number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="fromDate">Fecha Desde</label>
              <Input
                id="fromDate"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                type="date"
              />
            </div>
            <div className="bg-white z-10 pb-2">
              <label htmlFor="toDate">Fecha Hasta</label>
              <Input
                id="toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                type="date"
              />
            </div>
            <div className="flex justify-end">
              <Button className="text-current text-sm" variant={"bitcompay"}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
