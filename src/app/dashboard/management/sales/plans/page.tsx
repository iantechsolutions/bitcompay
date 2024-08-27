import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { Badge } from "~/components/ui/badge";
import { PlusCircleIcon } from "lucide-react";
import AddPlanDialog from "./AddPlanDialog";
import { RedirectButton } from "~/components/redirect-button";

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
              href={`/dashboard/management/sales/plans/${planes.id}`}
              title={planes.plan_code}
              trailing={<p>prueba</p>}
            />
          ))}
        </List>
      </section>
    </LayoutContainer>
  );
}
