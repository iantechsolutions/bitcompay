"use client";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/react";

export default function Home() {
  const family_groups = api.family_groups.list.useQuery().data;
  const receipt = family_groups?.filter(
    (x) => x.receipt !== null && x.receipt !== ""
  );
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Comprobantes</Title>
        </div>
        <List>
          {receipt && receipt.length > 0 ? (
            receipt.map((receipt) => {
              return (
                <ListTile
                  key={receipt.id}
                  leading={receipt.receipt}
                  href={`/maintenance/tables/receipts/${receipt.id}`}
                  title={receipt.numericalId}
                />
              );
            })
          ) : (
            <Title>No existen comprobantes</Title>
          )}
        </List>
      </section>
    </LayoutContainer>
  );
}
