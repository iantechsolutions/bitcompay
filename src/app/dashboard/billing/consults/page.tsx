"use client";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";
import LayoutContainer from "~/components/layout-container";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { LargeTable } from "~/components/table";
import { FacturasHeaders } from "~/server/uploads/validators";

import { useLayoutEffect, useState } from "react";

export default function Page() {
  const facturas = api.facturas.list.useQuery().data;
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
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Consultas</Title>
        </div>
        <div className="mt-5">
          {facturas && (
            <LargeTable
              height={height}
              headers={FacturasHeaders}
              rows={facturas}
            />
          )}
        </div>
      </section>
    </LayoutContainer>
  );
}
