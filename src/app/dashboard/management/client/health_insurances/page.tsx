"use client";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/react";

import { AddHealthInsurances } from "./AddHealthInsurances";

export default function Home() {
  const obraSocial = api.healthInsurances.list.useQuery().data;
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Obras sociales</Title>
          <AddHealthInsurances />
        </div>
        <List>
          {obraSocial ? (
            obraSocial.map((obraSocial) => {
              return (
                <ListTile
                  key={obraSocial.id}
                  leading={obraSocial.identificationNumber}
                  href={`/dashboard/management/client/health_insurances/${obraSocial.id}`}
                  title={obraSocial.name}
                />
              );
            })
          ) : (
            <Title>No existe ninguna obra social</Title>
          )}
        </List>
      </section>
    </LayoutContainer>
  );
}
