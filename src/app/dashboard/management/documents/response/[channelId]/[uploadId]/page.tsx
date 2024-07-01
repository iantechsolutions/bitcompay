import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import ResponseConfirmedPage from "./confirmed-page";
import ResponseUnconfirmedPage from "./unconfirmed-page";

export default async function Home(props: {
  params: { uploadId: string; channelId: string };
}) {
  const channel = await api.channels.get.query({
    channelId: props.params.channelId,
  });
  const upload = await api.uploads.responseUpload.query({
    id: props.params.uploadId,
  });

  if (!channel) {
    return <Title>El canal no existe.</Title>;
  }
  if (!upload) {
    return <Title>El documento no existe.</Title>;
  }

  return (
    <>
      {!upload.confirmed && (
        <ResponseUnconfirmedPage upload={upload} channel={channel} />
      )}
      {upload.confirmed && <ResponseConfirmedPage upload={upload} />}
    </>
  );
}
