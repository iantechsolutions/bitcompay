import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { Badge } from "~/components/ui/badge";
import AddPlans from "./AddPlans"; 


export default async function Page(props: { params: { companyId: string } }) {
  // cambiar luego por tramite router
  const planes = await api.plans.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Planes</Title>
          <AddPlans />
        </div>
        <List>
          {planes.map((planes) => (
            <ListTile
              key={planes.id}
              href={`/dashboard/${props.params.companyId}/management/sales/${planes.id}`}
              leading={<Badge>{planes.description}</Badge>}
              title={planes.plan_code}
            />
          ))}
        </List>
      </section>
    </LayoutContainer>
  );
}