"use client";

import { useLayoutEffect, useState } from "react";
import { LargeTable } from "~/components/table";
import { recHeaders } from "~/server/uploads/validators";
// import { TransactionsFiltersDialog } from "./transactions-filters";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es"; // import the locale
import { type RouterOutputs } from "~/trpc/shared";
dayjs.extend(utc);
dayjs.locale("es");
export default function TransactionsPage(props: {
  affiliates: RouterOutputs["family_groups"]["list"];
}) {
  const [height, setHeight] = useState(600);

  useLayoutEffect(() => {
    function handleResize() {
      setHeight(window.innerHeight - (90 + 24));
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
        rows={props.affiliates}
      />
      <div className="fixed right-20 top-4 z-10"></div>
    </div>
  );
}
