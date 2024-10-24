"use client";

import { Settings2Icon } from "lucide-react";
import { useState } from "react";
import CheckmarkCircle02Icon from "~/components/icons/checkmark-circle-02-stroke-rounded";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function TransactionsFiltersDialog(props: {
  filters: any;
  onChange: (filters: any) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-white"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <Settings2Icon className="mr-2" size={20} />
        Filtros
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtrar transacciones</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>
          <DialogFooter className="flex justify-self-start">
            <Button className="h-7 bg-[#BEF0BB] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-base rounded-full py-5 px-6">
              <CheckmarkCircle02Icon className="h-5 mr-2"/>
            Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
