import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";
import { AddClientDialog } from "./add-client-dialog";

export default async function Page(props: { params: { companyId: string } }) {
    // const client = await api..list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Clientes</Title>
          {/* <AddClientDialog /> */}
        </div>
        {/* <List>
          {client.map((client) => {
            return (
              <ListTile
                key={client.id}
                // href={`/dashboard/audit/benefits/${procedureComplete.id}`}
                leading={client.estado}
                title={client.id}
              />
            );
          })}
        </List> */}
      </section>
    </LayoutContainer>
  );
}
