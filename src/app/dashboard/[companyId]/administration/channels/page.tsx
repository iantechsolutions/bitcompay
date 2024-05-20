import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { AddChannelDialog } from "./add-channel-dialog";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";

export default async function Home(props: { params: { companyId: string } }) {
  const channels = await api.channels.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Canales</Title>
          <AddChannelDialog />
        </div>
        <List>
          {channels.map((channel) => {
            return (
              <ListTile
                key={channel.id}
                href={`/dashboard/${props.params.companyId}/administration/channels/${channel.id}`}
                leading={channel.number}
                title={channel.name}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
