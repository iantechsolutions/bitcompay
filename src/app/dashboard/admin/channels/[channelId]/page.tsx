import { Title } from '~/components/title'
import { channelsRelations } from '~/server/db/schema'
import { api } from '~/trpc/server'
import ChannelPage from './channel-page'

export default async function Channel(props: {
    params: { channelId: string }
}) {
    const channel = await api.channels.get.query({
        channelId: props.params.channelId,
    })

    if (!channelsRelations) {
        return <Title>No se encontró el canal</Title>
    }

    return <ChannelPage channel={channel} />
}
