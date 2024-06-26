import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import AddEstablishment from "./add-establishment";
export default async function Home(props: { params: { companyId: string } }) {
  const establishments = await api.establishments.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Establecimientos</Title>
          <AddEstablishment companyId={props.params.companyId} />
        </div>
        <List>
          {establishments.map((establishment) => {
            return (
              <ListTile
                key={establishment.id}
                title={establishment.establishment_number}
                href={`/dashboard/${props.params.companyId}/maintenance/tables/establishments/${establishment.id}`}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
