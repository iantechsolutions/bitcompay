"use client";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";

import { LargeTable } from "~/components/table";
import { ComprobantesHeaders } from "~/server/uploads/validators";

import { useLayoutEffect, useState } from "react";
import LayoutContainer from "~/components/layout-container";

export default function Page() {
  const comprobantes = api.comprobantes.list.useQuery().data;
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
    <LayoutContainer>
      <section className="space-y-5"></section>
      <div>
        <Title>Consultas</Title>
      </div>
      <div className="mt-5 flex overflow-x-auto overflow-y-auto">
        {comprobantes && (
          <LargeTable
            height={height}
            headers={ComprobantesHeaders}
            rows={comprobantes}
          />
        )}
      </div>
      <section className="space-y-5"></section>
    </LayoutContainer>
  );
}
