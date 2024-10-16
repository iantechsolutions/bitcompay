"use client";

import { useLayoutEffect, useState } from "react";
import { LargeTable } from "~/components/table";
import { recHeaders } from "~/server/uploads/validators";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es"; // Importar el idioma
import { type RouterOutputs } from "~/trpc/shared";
import LayoutContainer from "~/components/layout-container";

dayjs.extend(utc);
dayjs.locale("es");

export default function TransactionsPage(props: {
  transactions: RouterOutputs["transactions"]["list"];
}) {
  const [height, setHeight] = useState(0); // Inicializa a 0

  useLayoutEffect(() => {
    function handleResize() {
      setHeight(window.innerHeight - (90 + 24)); // Ajusta la altura según el tamaño de la ventana
    }

    window.addEventListener("resize", handleResize);

    handleResize(); // Llama a la función al cargar el componente

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const tableRows = props.transactions.map((transaction) => {
    return {
      ...transaction,
      period: dayjs.utc(transaction.period).format("MMMM YYYY").toUpperCase(),
    };
  });

  return (
    <div className="overflow-x-auto max-h-[calc(100vh-114px)]">
      {" "}
      {/* Ajusta la altura máxima según sea necesario */}
      <LargeTable height={height} headers={recHeaders} rows={tableRows} />
    </div>
  );
}
