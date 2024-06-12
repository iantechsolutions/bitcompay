import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import AddBonusDialog from "./add-bonus-dialog";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { type Bonuses } from "~/server/db/schema";
interface Props {
  params: {
    companyId: string;
  };
}

export default async function Home(props: Props) {
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
                href={`/dashboard/${props.params.companyId}/management/sales/bonuses/${bonus.id}`}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
