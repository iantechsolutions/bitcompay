import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";
import { AddProviderDialog } from "./add-provider-dialog";

export default async function Page(props: { params: { companyId: string } }) {
  const providers = await api.providers.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Proveedores</Title>
          <AddProviderDialog />
        </div>
        <List>
          {providers.map((provider) => {
            return (
              <ListTile
                key={provider.id}
                href={`/dashboard/${props.params.companyId}/administration/providers/${provider.id}`}
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
