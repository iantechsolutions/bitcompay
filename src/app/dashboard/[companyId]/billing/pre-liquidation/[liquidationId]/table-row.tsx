"use client";
import { TableCell } from "~/components/ui/table";
import { CircleChevronDown } from "lucide-react";
import { useState } from "react";
import TriggerTable from "./trigger-table";
import ContentTable from "./content-table";
export default function TableRowContainer() {
  const [active, setActive] = useState(false);
  return (
    <div className="flex flex-col">
      <div className="flex-flex-row">
        <button onClick={() => setActive(!active)}>
          <CircleChevronDown />
        </button>
        <TriggerTable />
      </div>
      <div className="flex flex-row">{active && <ContentTable />}</div>
    </div>
  );
}
