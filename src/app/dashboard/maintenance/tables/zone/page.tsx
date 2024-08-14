"use client";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { AddZones } from "./AddZones";

export default function Home() {
  const { data: zonas } = api.zone.list.useQuery();

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Zonas</Title>
          <AddZones />
        </div>
        <List>
          {zonas ? (
            zonas.map((zone) => {
              return (
                <div>
                  <ListTile
                    key={zone.id}
                    title={zone.name}
                    subtitle={`CP: ${zone.cp}`}
                    href={`/dashboard/maintenance/tables/zone/${zone.id}`}
                  />
                </div>
              );
            })
          ) : (
            <h1>No existen zonas</h1>
          )}
        </List>
      </section>
    </LayoutContainer>
  );
}
