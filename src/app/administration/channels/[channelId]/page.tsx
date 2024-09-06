import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import ChannelPage from "./channel-page";
import { auth } from "@clerk/nextjs/server";

export default async function Channel(props: {
  params: { channelId: string };
}) {
  const channel = await api.channels.get.query({
    channelId: props.params.channelId,
  });

  if (!channel) {
    return <Title>No se encontró el canal</Title>;
  }

  return <ChannelPage channel={channel} />;
}
