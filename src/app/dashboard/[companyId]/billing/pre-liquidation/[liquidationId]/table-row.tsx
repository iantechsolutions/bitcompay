"use client";
import { TableCell } from "~/components/ui/table";
import { CircleChevronDown } from "lucide-react";
import { useState } from "react";
import TriggerTable from "./trigger-table";
import ContentTable from "./content-table";

export default function TableRowContainer() {
  const [active, setActive] = useState(false);

  return (
    <>
      <TriggerTable setActive={setActive} active={active} />
      {active && <ContentTable />}
    </>
  );
}
