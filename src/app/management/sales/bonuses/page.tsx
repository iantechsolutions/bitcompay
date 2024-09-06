"use client";

import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/react";
import AddBonusDialog from "./add-bonus-dialog";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";

export default function Home() {
  // const bonuses: Bonuses[] = await api.bonuses.list.query();
  const { data: bonuses } = api.bonuses.list.useQuery();
  console.log(bonuses);
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Bonificaciones</Title>
          <AddBonusDialog />
        </div>
        <List>
          {bonuses
            ? bonuses.map((bonus) => {
                return (
                  <ListTile
                    key={bonus.id}
                    title={bonus.reason}
                    href={`/management/sales/bonuses/${bonus.id}`}
                  />
                );
              })
            : null}
        </List>
      </section>
    </LayoutContainer>
  );
}
