import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import { AddModo } from "./add-modo";
import { modos } from "~/server/db/schema";

export default async function Home() {
  const modos = await api.modo.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Modos</Title>
            <AddModo/>
        </div>
        <List>
          {modos.map((modos) => {
            return (
              <ListTile
                key={modos.id}
                  leading={modos.description}
                href={`/dashboard/admin/modos/${modos.id}`}
                title={modos.description}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
