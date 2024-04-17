import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { AddStatusDialog } from "./add-status-dialog";
import { api } from "~/trpc/server";

export default async function StatusPage() {
  const statuses = await api.status.list.query();

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Estados de Transacción</Title>
          <AddStatusDialog />
        </div>
        <List>
          {statuses.map((status) => {
            return (
              <ListTile
                leading={status.code}
                key={status.id}
                href={`/dashboard/admin/statuses/${status.id}`}
                title={status.description}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
