import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import AddPlanDialog from "./AddPlanDialog";
import { Button } from "~/components/ui/button";
import DeleteButton from "~/components/plan/delete-plan";
import SeeButton from "~/components/plan/see-plan";

export default async function Page() {
  // cambiar luego por tramite router
  const planes = await api.plans.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Planes</Title>
          <AddPlanDialog />
        </div>
        <List>
          {planes.map((planes) => (
            <ListTile
              className="pl-10 pr-5 "
              key={planes.id}
              title={planes.plan_code}
              trailing={<div className="flex gap-2">
                <SeeButton id={planes.id} />
                <DeleteButton id={planes.id} />
              </div>}
            />
          ))}
        </List>
      </section>
    </LayoutContainer>
  );
}

