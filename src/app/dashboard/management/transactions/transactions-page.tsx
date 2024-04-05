"use client";

import { useLayoutEffect, useState } from "react";
import { LargeTable } from "~/components/table";
import { recHeaders } from "~/server/uploads/validators";
import { TransactionsFiltersDialog } from "./transactions-filters";

export default function TransactionsPage(props: {
  transactions: Record<string, any>[];
}) {
  const [height, setHeight] = useState(600);

  useLayoutEffect(() => {
    function handleResize() {
      setHeight(window.innerHeight - (70 + 24));
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <LargeTable
        height={height}
        headers={recHeaders}
        rows={props.transactions}
      />
      <div className="fixed right-20 top-4 z-10">
        <TransactionsFiltersDialog filters={0} onChange={() => {}} />
      </div>
    </div>
  );
}
