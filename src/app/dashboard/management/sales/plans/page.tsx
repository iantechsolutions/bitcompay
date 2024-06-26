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
          <RedirectButton url="./plans/add">
            <PlusCircleIcon className="mr-2" size={20} />
            Agregar Plan
          </RedirectButton>
          {/* <AddPlanDialog
            params={{
              planId: "",
            }}
          /> */}
        </div>
        <List>
          {planes.map((planes) => (
            <ListTile
              key={planes.id}
              href={`/dashboard/management/sales/plans/info/${planes.id}`}
              leading={<Badge>{planes.description}</Badge>}
              title={planes.plan_code}
            />
          ))}
        </List>
      </section>
    </LayoutContainer>
  );
}
