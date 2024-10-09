import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
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
        <Button>Bonus</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-lg font-semibold">Seleccionar Bonus</h2>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="group">Grupo Familiar</label>
            <Input
              id="group"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="Selecciona grupo familiar"
            />
          </div>
          <div>
            <label htmlFor="percentage">Porcentaje</label>
            <div className="input-with-suffix">
              <Input
                id="percentage"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="Introduce un porcentaje"
                type="number"
              />
              <span className="suffix">%</span>
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
          <div>
            <label htmlFor="toDate">Fecha Hasta</label>
            <Input
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              type="date"
            />
          </div>
        </div>

        <DialogFooter>
          <Button>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
