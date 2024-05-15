import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import { AddModo } from "./add-modo";
import { procedure } from "~/server/db/schema";

export default async function Home() {
  // const procedure = await api.procedure.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>procedures</Title>
            <AddModo/>
        </div>
        {/* <List>
          {procedure.map((procedure) => {
            return (
              <ListTile
                key={procedure.id}
                  leading={procedure.estado}
                href={`/dashboard/admin/procedures/${procedure.id}`}
                title={procedure.code}
              />
            );
          })}
        </List> */}
      </section>
    </LayoutContainer>
  );
}
