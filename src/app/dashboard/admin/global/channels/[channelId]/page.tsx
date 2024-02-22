import AppSidenav from "~/components/admin-sidenav";
import AppLayout from "~/components/applayout";
import { Title } from "~/components/title";
import { getServerAuthSession } from "~/server/auth";
import ChannelPage from "./channel-page";
import { api } from "~/trpc/server";

export default async function Channel(props: { params: { channelId: string } }) {
    const session = await getServerAuthSession();

    const channel = await api.channels.get.query({ channelId: props.params.channelId })

    if (!channel || !session?.user) {
        return <AppLayout
            title={<h1>Error 404</h1>}
            user={session?.user}
            sidenav={<AppSidenav />}
        >
            <Title>No se encontró el canal</Title>
        </AppLayout>
    }

    return <ChannelPage channel={channel} user={session.user} />
}