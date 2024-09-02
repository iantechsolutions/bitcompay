"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import CreditCardPosIcon from "../icons/credit-card-pos-stroke-rounded";
import { useState } from "react";
import { RouterOutputs } from "~/trpc/shared";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
export default function EditPrice({
  plan,
}: {
  plan?: RouterOutputs["plans"]["get"];
}) {
  const [anio, setAnio] = useState(2020);
  const [mes, setMes] = useState(0);
  const [vigente, setVigente] = useState<Date>();
  const [percent, setPercent] = useState("");
  const [open, setOpen] = useState(false);
  const { mutateAsync: createPricePerAge, isLoading } =
  api.pricePerCondition.create.useMutation();
  const router=useRouter();
  async function handleUpdatePrice() {
    
    if (plan?.pricesPerCondition) {
      if (
        plan?.pricesPerCondition.filter(
          (x) => x.validy_date.getTime() === new Date(anio, mes, 1).getTime()
        ).length === 0
      ) {
        const validPrices = plan.pricesPerCondition.filter(
          (x) => x.validy_date.getTime() === vigente?.getTime()
        );
        for (const price of validPrices) {
          await createPricePerAge({
            plan_id: plan.id ?? "",
            amount: price.amount * (1 + parseFloat(percent) / 100),
            from_age: price.from_age ?? 0,
            to_age: price.to_age ?? 0,
            condition: price.condition ?? "",
            isAmountByAge: price.isAmountByAge,
            validy_date: new Date(anio, mes, 1),
          });
        }
        setOpen(false);
      } else {
        toast.error("Ya existe un listado de precios para el mes seleccionado");
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-transparent hover:bg-transparent p-0 text-[#3e3e3e] shadow-none h-5">
            <CreditCardPosIcon className="mr-1 h-4" /> Actualizar Precio
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            disabled={
              plan?.pricesPerCondition.filter(
                (x) => x.validy_date.getTime() <= new Date().getTime()
              ).length === 0
            }
          >
            <div>Actualizar porcentualmente</div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              href={`/dashboard/management/sales/plans/${plan?.id}/editPrice`}
            >
              Actualizar manualmente
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-visible">
          <DialogHeader>
            <DialogTitle>Actualizar porcentualmente precio de plan</DialogTitle>
          </DialogHeader>
          <Label htmlFor="validy_date">Mes de vigencia</Label>
          <Select
            onValueChange={(e) => setMes(Number(e))}
            defaultValue={mes.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="0"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 0, 1).getTime()
                  ).length !== 0
                }
              >
                Enero
              </SelectItem>
              <SelectItem
                value="1"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 1, 1).getTime()
                  ).length !== 0
                }
              >
                Febrero
              </SelectItem>
              <SelectItem
                value="2"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 2, 1).getTime()
                  ).length !== 0
                }
              >
                Marzo
              </SelectItem>
              <SelectItem
                value="3"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 3, 1).getTime()
                  ).length !== 0
                }
              >
                Abril
              </SelectItem>
              <SelectItem
                value="4"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 4, 1).getTime()
                  ).length !== 0
                }
              >
                Mayo
              </SelectItem>
              <SelectItem
                value="5"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 5, 1).getTime()
                  ).length !== 0
                }
              >
                Junio
              </SelectItem>
              <SelectItem
                value="6"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 6, 1).getTime()
                  ).length !== 0
                }
              >
                Julio
              </SelectItem>
              <SelectItem
                value="7"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 7, 1).getTime()
                  ).length !== 0
                }
              >
                Agosto
              </SelectItem>
              <SelectItem
                value="8"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 8, 1).getTime()
                  ).length !== 0
                }
              >
                Septiembre
              </SelectItem>
              <SelectItem
                value="9"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 9, 1).getTime()
                  ).length !== 0
                }
              >
                Octubre
              </SelectItem>
              <SelectItem
                value="10"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() ===
                      new Date(anio, 10, 1).getTime()
                  ).length !== 0
                }
              >
                Noviembre
              </SelectItem>
              <SelectItem
                value="11"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() ===
                      new Date(anio, 11, 1).getTime()
                  ).length !== 0
                }
              >
                Diciembre
              </SelectItem>
            </SelectContent>
          </Select>
          <div>
            <Label>Año de Vigencia</Label>
            <Input
              className="border-green-300 focus-visible:ring-green-400 w-[100px]"
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
            />
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
          <div>
            <Button disabled={isLoading} onClick={handleUpdatePrice}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Actualizar precio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
