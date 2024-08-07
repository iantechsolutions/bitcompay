import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";

export default async function PageGenerate() {
  const channels = await api.channels.list.query();

  return (
    <>
      <Title>Generar archivos de salida</Title>
      <List>
        {channels.map((channel) => {
          return (
            <ListTile
              key={channel.id}
              leading={channel.number}
              title={channel.name}
              href={`./output/${channel.id}`}
            />
          );
        })}
      </List>
    </>
  );
}
