import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

import { DialogHeader, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

export default function BonusDialog() {
  const [group, setGroup] = useState("");
  const [percentage, setPercentage] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <Dialog>
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
