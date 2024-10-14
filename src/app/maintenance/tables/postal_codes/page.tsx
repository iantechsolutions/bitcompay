"use client";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/react";

import { AddPostalCode } from "./add-postalcode-dialog";

export default function Home() {
  const postalCodes = api.postal_code.list.useQuery();

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Código postal</Title>
          <AddPostalCode />
        </div>
      </section>
      <List>
        {postalCodes.data && postalCodes.data.length > 0 ? (
          postalCodes.data.map((postalCode) => (
            <ListTile
              key={postalCode.id}
              title={
                postalCode.zoneData ? postalCode.zoneData.name : postalCode.zone
              }
              href={`/maintenance/tables/postal_codes/${postalCode.id}`}
              leading={postalCode.cp}
            />
          ))
        ) : (
          <Title>No hay códigos postales subidos</Title>
        )}
      </List>
    </LayoutContainer>
  );
}
