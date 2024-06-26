import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import AddEstablishment from "./add-establishment";
import { auth } from "@clerk/nextjs/server";
export default async function Home() {
  const establishments = await api.establishments.list.query();
  const { orgId } = auth();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Establecimientos</Title>
          <AddEstablishment companyId={orgId!} />
        </div>
        <List>
          {establishments.map((establishment) => {
            return (
              <ListTile
                key={establishment.id}
                title={establishment.establishment_number}
                href={`/dashboard/maintenance/tables/establishments/${establishment.id}`}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
