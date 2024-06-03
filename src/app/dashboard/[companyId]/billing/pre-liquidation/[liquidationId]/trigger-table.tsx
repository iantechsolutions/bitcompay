"use client";
import {
  CircleChevronDown,
  CircleChevronRight,
  CircleChevronUp,
} from "lucide-react";
import { TableCell, TableRow } from "~/components/ui/table";

interface TriggerTableProps {
  setActive: (value: boolean) => void;
  active: boolean;
}

export default function TriggerTable({ setActive, active }: TriggerTableProps) {
  return (
    <TableRow className="relative overflow-visible">
      <TableCell className="  border-gray-600 p-1.5 flex items-center">
        <button onClick={() => setActive(!active)}>
          {active && <CircleChevronDown />}
          {!active && <CircleChevronRight />}
        </button>
      </TableCell>

      <TableCell>Hello</TableCell>
      <TableCell>how </TableCell>
      <TableCell>are </TableCell>
      <TableCell> u</TableCell>
    </TableRow>
  );
}
