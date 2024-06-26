import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { AddBussiness } from "./AddBussiness";
import { type Bonuses } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const unidades = await api.bussinessUnits.list.query();
  const { orgId } = auth();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Unidades de negocio</Title>
          <AddBussiness
            params={{
              companyId: orgId!,
            }}
          />
        </div>
        <List>
          {unidades.map((unidades) => {
            return (
              <ListTile
                key={unidades.id}
                title={unidades.description}
                href={`/dashboard/maintenance/tables/bussiness_unit/${unidades.id}`}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
