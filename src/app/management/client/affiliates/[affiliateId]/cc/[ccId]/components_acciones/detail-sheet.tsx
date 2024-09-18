import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { RouterOutputs } from "~/trpc/shared";
import { useState } from "react";
import { api } from "~/trpc/react";

type DetailSheetProps = {
  
  open: boolean;
  setOpen: (open: boolean) => void;
};
export default function DetailSheet({ open, setOpen }: DetailSheetProps) {
 return (
  <Sheet open={open} onOpenChange={setOpen}>
  <SheetContent className="sm:max-w-[550px] px-10 py-12 overflow-y-scroll">
    <SheetHeader>
      <SheetTitle className="font-semibold text-2xl">
        Detalle del movimiento
      </SheetTitle>
      <SheetDescription>
        <ul className="mt-2">
              <li className="text-xs"> RECEPTOR </li>
              <li className="font-medium-medium text-[#3e3e3e]">
                Natuti Marc
              </li>
              <br />
              <li className="text-xs"> CUIL/CUIT </li>
              <li className="font-medium-medium text-[#3e3e3e]">
                987654321
                </li>
              <br />
            </ul>
      </SheetDescription>
    </SheetHeader>

    <div className="flex flex-row border justify-between items-center px-4 py-5 gap-2 rounded-md mt-3">
          <p className="text-base whitespace-nowrap font-medium-medium ">Saldo actual </p>
          <p className="text-[#6952EB] whitespace-nowrap font-semibold text-lg">
            $123.456.789 
          </p>
        </div>
        <div className="mt-5">
        {/* Acá poner Content Table, este es solo un ejemplo */}
            <Table>
            <TableHeader className="bg-[#F7F7F7] rounded-lg">
              <TableHead className="pl-4 "> Concepto </TableHead>
              <TableHead className=" "> Importe </TableHead>
              <TableHead className=" "> IVA</TableHead>
              <TableHead className="">TOTAL</TableHead>
            </TableHeader>
            <TableRow className="border-b ">
                    <TableCell className="pl-4 ">Bonificación</TableCell>
                    <TableCell className=" ">
                    -$12.345
                    </TableCell>
                    <TableCell className=" ">
                    -$12.345
                    </TableCell>
                    <TableCell className=" ">
                    -$12.345
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b ">
                    <TableCell className="pl-4 ">Abono</TableCell>
                    <TableCell className=" ">
                      $123.456
                    </TableCell>
                    <TableCell className=" ">
                    $123.456
                    </TableCell>
                    <TableCell className=" ">
                    $123.456
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b ">
                    <TableCell className="pl-4 ">Facturación anterior</TableCell>
                    <TableCell className=" ">
                      $123.456
                    </TableCell>
                    <TableCell className=" ">
                    $123.456
                    </TableCell>
                    <TableCell className=" ">
                    $123.456
                    </TableCell>
                  </TableRow>
          </Table>
        </div>
        <div className="bg-[#DEF5DD] flex flex-row justify-between items-center py-4 px-6 rounded-md mt-4">
            <p className=" text-[#6952EB] font-semibold">
              Importe total:{" "}
            </p>
            <p className="text-[#6952EB] font-semibold">
              $123.456.789
            </p>
          </div>
  </SheetContent>
</Sheet>

 )
}

