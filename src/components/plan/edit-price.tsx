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
  fecha,
}: {
  plan?: RouterOutputs["plans"]["get"];
  fecha?: number;
}) {
  const [anio, setAnio] = useState(2022);
  const [mes, setMes] = useState(0);
  const [percent, setPercent] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const { mutateAsync: createPricePerAge, isLoading } =
    api.pricePerCondition.create.useMutation();
  const router = useRouter();

  async function handleUpdatePrice() {
    console.log("Llego");
    if (plan?.pricesPerCondition) {
      if (
        plan?.pricesPerCondition.filter(
          (x) => x.validy_date.getTime() === new Date(anio, mes, 1).getTime()
        ).length === 0
      ) {
        const validPrices = plan.pricesPerCondition.filter(
          (x) => x.validy_date.getTime() === fecha
        );
        for (const price of validPrices) {
          await createPricePerAge({
            plan_id: plan.id ?? "",
            amount: price.amount + price.amount * (percent / 100),
            from_age: price.from_age ?? 0,
            to_age: price.to_age ?? 0,
            condition: price.condition ?? "",
            isAmountByAge: price.isAmountByAge,
            validy_date: new Date(anio, mes, 1),
          });
        }

        window.location.reload();
        toast.success("Se actualizo el listado de precios");
        setOpen(false);
      } else {
        toast.error("Ya existe un listado de precios para el mes seleccionado");
      }
    }
  }
  //dasdes
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-transparent w-full hover:bg-transparent p-0 text-[#3e3e3e] shadow-none h-5">
            <CreditCardPosIcon className="mr-1 h-4" /> Actualizar precio
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            disabled={
              plan?.pricesPerCondition.filter(
                (x) => x.validy_date.getTime() <= new Date().getTime()
              ).length === 0
            }>
            <div>Actualizar porcentualmente</div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            {fecha ? (
              <Link
                href={`/management/sales/plans/${plan?.id}/details/${fecha}/editDate`}>
                Actualizar manualmente
              </Link>
            ) : (
              <Link href={`/management/sales/plans/${plan?.id}/editPrice`}>
                Actualizar manualmente
              </Link>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-visible m-3 rounded-2xl">
          <DialogHeader className="p-2 ml-2">
            <DialogTitle>Actualizar porcentualmente precio de plan</DialogTitle>
          </DialogHeader>
          <div className="w-1/4 text-gray-500 mb-2 ml-3">
            <Label htmlFor="validy_date">Mes de vigencia</Label>
            <Select
              onValueChange={(e) => setMes(Number(e))}
              defaultValue={mes.toString()}>
              <SelectTrigger className="w-full border-[#BEF0BB] border-0 border-b text-[#3E3E3E] bg-background rounded-none focus-visible:ring-green-400">
                <SelectValue placeholder="Seleccione un mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="0"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 0, 1).getTime()
                    ).length !== 0
                  }>
                  Enero
                </SelectItem>
                <SelectItem
                  value="1"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 1, 1).getTime()
                    ).length !== 0
                  }>
                  Febrero
                </SelectItem>
                <SelectItem
                  value="2"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 2, 1).getTime()
                    ).length !== 0
                  }>
                  Marzo
                </SelectItem>
                <SelectItem
                  value="3"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 3, 1).getTime()
                    ).length !== 0
                  }>
                  Abril
                </SelectItem>
                <SelectItem
                  value="4"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 4, 1).getTime()
                    ).length !== 0
                  }>
                  Mayo
                </SelectItem>
                <SelectItem
                  value="5"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 5, 1).getTime()
                    ).length !== 0
                  }>
                  Junio
                </SelectItem>
                <SelectItem
                  value="6"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 6, 1).getTime()
                    ).length !== 0
                  }>
                  Julio
                </SelectItem>
                <SelectItem
                  value="7"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 7, 1).getTime()
                    ).length !== 0
                  }>
                  Agosto
                </SelectItem>
                <SelectItem
                  value="8"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 8, 1).getTime()
                    ).length !== 0
                  }>
                  Septiembre
                </SelectItem>
                <SelectItem
                  value="9"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 9, 1).getTime()
                    ).length !== 0
                  }>
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
                  }>
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
                  }>
                  Diciembre
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-1/4 text-gray-500 mb-2 ml-3">
            <Label>Año de Vigencia</Label>
            <Input
              className="w-full border-[#BEF0BB] border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              value={anio}
              type="number"
              onChange={(e) => setAnio(parseInt(e.target.value))}
            />
          </div>

          <div className="w-1/4 text-gray-500 mb-2 ml-3">
            <Label htmlFor="percent">Porcentaje de aumento</Label>
            <Input
              id="percent"
              className="w-full border-[#BEF0BB] border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              placeholder="Ej: 30%"
              value={percent}
              type="number"
              onChange={(e) => setPercent(parseInt(e.target.value))}
            />
          </div>
          <div>
            <Button
              onClick={handleUpdatePrice}
              disabled={isLoading}
              className="bg-[#BEF0BB] hover:bg-[#DEF5DD] ml-3 rounded-full mr-4 px-6 text-black font-normal hover:text-[#3E3E3E]">
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              <CreditCardPosIcon className="mr-2 h-5 font-medium-medium w-full" />
              Actualizar precio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
