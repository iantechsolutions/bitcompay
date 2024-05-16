import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import { AddBonus } from "./add-bonuses"; 

  
export default async function Home() {

  const bonus = await api.bonuses.list.query();


  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Bonificaciones</Title>
            <AddBonus/>
        </div>
        <List>
          {bonus.map((bonus) => {
            return (
              <ListTile
                key={bonus.id}
                  leading={bonus.amount}
                href={`/dashboard/admin/bonuses/${bonus.id}`}
                title={bonus.reason}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
