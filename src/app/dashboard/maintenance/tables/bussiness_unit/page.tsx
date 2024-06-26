import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { AddBussiness } from "./AddBussiness"; 
import { type Bonuses } from "~/server/db/schema";


export default async function Home(props: { params: { companyId: string } }) {
  const unidades = await api.bussinessUnits.list.query();

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Unidades de negocio</Title>
          <AddBussiness params={{
                      companyId: props.params.companyId
                  }} />
        </div>
        <List>
          {unidades.map((unidades) => {
            return (
              <ListTile
                key={unidades.id}
                title={unidades.description}
                href={`/dashboard/${props.params.companyId}/maintenance/tables/bussiness_unit/${unidades.id}`}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
