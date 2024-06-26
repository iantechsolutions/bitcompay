import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import AddBonusDialog from "./add-bonus-dialog";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { type Bonuses } from "~/server/db/schema";

export default async function Home() {
  const bonuses: Bonuses[] = await api.bonuses.list.query();

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Bonificaciones</Title>
          <AddBonusDialog />
        </div>
        <List>
          {bonuses.map((bonus) => {
            return (
              <ListTile
                key={bonus.id}
                title={bonus.reason}
                href={`/dashboard/management/sales/bonuses/${bonus.id}`}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
