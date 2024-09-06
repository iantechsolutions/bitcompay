import { CircleUserRound } from "lucide-react";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { AddProviderDialog } from "./add-provider-dialog";

export default async function Page() {
  const providers = await api.providers.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Proveedores ABM</Title>
          <AddProviderDialog />
        </div>
        <List>
          {providers.map((provider) => {
            return (
              <ListTile
                key={provider.id}
                href={`/management/suppliers/abm/${provider.id}`}
                title={provider.name}
                leading={<CircleUserRound />}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
