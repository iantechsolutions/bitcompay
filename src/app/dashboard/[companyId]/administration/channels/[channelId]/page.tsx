import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import ChannelPage from './channel-page'

export default async function Channel(props: {
  params: { companyId: string; channelId: string };
}) {
    const channel = await api.channels.get.query({
        channelId: props.params.channelId,
    })

    if (!channel) {
        return <Title>No se encontró el canal</Title>
    }

  return (
    <ChannelPage
      channel={channel}
      user={session.user}
      companyId={props.params.companyId}
    />
  );
}
