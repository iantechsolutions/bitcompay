"use client";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";

import { LargeTable } from "~/components/table";
import { FacturasHeaders } from "~/server/uploads/validators";

import { useLayoutEffect, useState } from "react";

export default function Page() {
  const facturas = api.facturas.list.useQuery().data;
  const [height, setHeight] = useState(1200);
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
      <div className="flex justify-between">
        <Title>Consultas</Title>
      </div>
      <div className="mt-5 flex overflow-x-auto overflow-y-auto">
        {facturas && (
          <LargeTable
            height={height}
            headers={FacturasHeaders}
            rows={facturas}
          />
        )}
      </div>
    </div>
  );
}
