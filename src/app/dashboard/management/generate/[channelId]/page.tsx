import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import GenerateChannelOutputPage from "./generate-channel-output";

export default async function Page(props: { params: { channelId: string } }) {
    const channel = await api.channels.get.query({ channelId: props.params.channelId })

    if(!channel) {
        return <Title>Channel not found</Title>
    }

    return <GenerateChannelOutputPage channel={channel} />
}