import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";

export default async function PageGenerate() {
    const channels = await api.channels.list.query()

    return <>
        <Title>Generar archivos de entrada</Title>
        <List>
            {channels.map(channel => {

                return <ListTile
                    leading={channel.number}
                    title={channel.name}
                    href={`./generate/${channel.id}`}
                />
            })}
        </List>
    </>
}