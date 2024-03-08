import { Title } from "~/components/title";
import ChannelPage from "./channel-page";
import { api } from "~/trpc/server";

export default async function Channel(props: { params: { channelId: string } }) {
    const channel = await api.channels.get.query({ channelId: props.params.channelId })

    if (!channel) {
        return <Title>No se encontró el canal</Title>
    }

    return <ChannelPage channel={channel} />
}