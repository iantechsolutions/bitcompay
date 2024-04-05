import { getServerAuthSession } from "~/server/auth";
import UploadResponsePage from "./upload-response-page";
import { api } from "~/trpc/server";

export default async function PageResponse(props: {
  params: { channelId: string };
}) {
  const channel = await api.channels.get.query({
    channelId: props.params.channelId,
  });

  return <>{channel && <UploadResponsePage channel={channel} />}</>;
}
