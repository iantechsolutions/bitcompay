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
    <TableRow>
      <TableCell>
        <button onClick={() => setActive(!active)}>
          {active && <CircleChevronDown />}
          {!active && <CircleChevronRight />}
        </button>
      </TableCell>
      <TableCell>Hello</TableCell>
      <TableCell>how </TableCell>
      <TableCell>how </TableCell>
      <TableCell>are </TableCell>
      <TableCell>you</TableCell>
    </TableRow>
  );
}
