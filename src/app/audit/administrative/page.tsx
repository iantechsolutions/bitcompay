import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";

export default async function Page() {
  const procedure = await api.procedure.list.query();
  const procedureComplete = procedure.filter(
    (procedure) => procedure.estado === "pendiente"
  );

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Administrativo</Title>
        </div>
        <List>
          {procedureComplete.map((procedureComplete) => {
            return (
              <ListTile
                key={procedureComplete.id}
                href={`/audit/administrative/${procedureComplete.id}`}
                leading={procedureComplete.estado}
                title={procedureComplete.id}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}