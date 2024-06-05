"use client";
import {
  CircleChevronDown,
  CircleChevronRight,
  CircleChevronUp,
} from "lucide-react";
import { TableCell, TableRow } from "~/components/ui/tablePreliq";

interface TriggerTableProps {
  setActive: (value: boolean) => void;
  active: boolean;
}

export default function TriggerTable({ setActive, active }: TriggerTableProps) {
  return (
    <TableRow
      className="rounded-lg bg-[#f0f0f0]
    "
    >
      <TableCell className=" relative rounded-l-md border border-[#6cebd1]">
        <button
          className=" p-0 absolute left-[-8px] top-0 bottom-0"
          onClick={() => setActive(!active)}
        >
          {active && (
            <CircleChevronDown className="bg-[#6cebd1] h-4 w-4 rounded-full" />
          )}
          {!active && (
            <CircleChevronRight className="bg-[#6cebd1] h-4 w-4 rounded-full" />
          )}
        </button>
        193
      </TableCell>

      <TableCell className="border border-[#6cebd1] p-2 py-4">how </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">are </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> u</TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> u</TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> u</TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> u</TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> u</TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> u</TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> u</TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> u</TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> u</TableCell>
      <TableCell className="rounded-r-md border border-[#6cebd1]"> u</TableCell>
    </TableRow>
  );
}
