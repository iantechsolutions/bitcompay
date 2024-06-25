"use client";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Badge } from "~/components/ui/badge";

import { List, ListTile } from "~/components/list";
import utc from "dayjs/plugin/utc";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { useCompanyData } from "~/app/dashboard/[companyId]/company-provider";
import { type RouterOutputs } from "~/trpc/shared";
import { useEffect, useState } from "react";
import { datetime } from "drizzle-orm/mysql-core";
dayjs.extend(utc);
dayjs.locale("es");

export default function PlanPage(props: {
  plan: RouterOutputs["plans"]["get"];
}) {
  const formatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [arrayFechas, setArrayFechas] = useState<Date[]>([]);
  const [vigente, setVigente] = useState<Date>();

  useEffect(() => {
    props.plan?.pricesPerAge?.map((precio) => {
      const fecha = precio?.validy_date; // Convertir la fecha a cadena
      if (fecha) {
        if (!arrayFechas.find((x) => x.getTime() == fecha.getTime()!)) {
          arrayFechas.push(fecha);
        }
      }
    });
    const sortedArrayFechas = [...arrayFechas];
    sortedArrayFechas.sort((a, b) => b.getTime() - a.getTime());

    setArrayFechas(sortedArrayFechas);

    const fechasPasadas = arrayFechas.filter(
      (fecha) => fecha.getTime() <= new Date().getTime()
    );

    fechasPasadas.sort((a, b) => b.getTime() - a.getTime());

    const ultimaFechaPasada =
      fechasPasadas.length > 0 ? fechasPasadas[0] : null;

    if (ultimaFechaPasada) {
      setVigente(ultimaFechaPasada);
    }

    console.log(fechasPasadas);
    console.log(vigente);
  }, []);

  const company = useCompanyData();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex-col justify-between">
          <Title>{props.plan!.description}</Title>
          <List>
            {arrayFechas.map((fecha) => {
              if (arrayFechas.indexOf(fecha) === vigente?.getDate()) {
                return (
                  <ListTile
                    leading={<Badge>Vigente</Badge>}
                    key={fecha.toISOString().split("T")[0]}
                    href={`/dashboard/${company.id}/management/sales/plans/${
                      props.plan?.id
                    }/${fecha.getTime()}`}
                    title={
                      "Vigente desde: " +
                      formatter.format(fecha).charAt(0).toUpperCase() +
                      formatter.format(fecha).slice(1)
                    }
                  />
                );
              } else {
                return (
                  <ListTile
                    leading={<Badge variant={"outline"}>No Vigente</Badge>}
                    key={fecha.toISOString().split("T")[0]}
                    href={`/dashboard/${company.id}/management/sales/plans/${
                      props.plan?.id
                    }/${fecha.getTime()}`}
                    title={
                      "Vigente desde: " +
                      formatter.format(fecha).charAt(0).toUpperCase() +
                      formatter.format(fecha).slice(1)
                    }
                  />
                );
              }
            })}
          </List>
        </div>
      </section>
    </LayoutContainer>
  );
}
