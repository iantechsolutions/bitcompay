"use client";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";

import { LargeTable } from "~/components/table";
import { ComprobantesHeaders } from "~/server/uploads/validators";

import { useLayoutEffect, useState } from "react";

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
    <div>
      <div className="flex justify-between">
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
    </div>
  );
}
