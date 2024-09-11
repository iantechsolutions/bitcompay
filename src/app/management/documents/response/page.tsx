import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import LayoutContainer from "~/components/layout-container";
import { api } from '~/trpc/server'

export default async function PageGenerate() {
    const channels = await api.channels.list.query()

    return (
        <>
        <LayoutContainer>
            <Title>Leer archivos de respuesta</Title>
            <List>
                {channels.map((channel) => {
                    return <ListTile key={channel.id} leading={channel.number} title={channel.name} href={`./response/${channel.id}`} />
                })}
            </List>
        </LayoutContainer>
        </>
    )
}
