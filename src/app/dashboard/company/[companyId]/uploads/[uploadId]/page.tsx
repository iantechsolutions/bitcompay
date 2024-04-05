import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import UploadedUnconfirmedPage from "./uploaded-unconfirmed-page";
import UploadedConfirmedPage from "./uploaded-confirmed-page";

export default async function Home(props: { params: { uploadId: string } }) {
  const upload = await api.uploads.upload.query({ id: props.params.uploadId });

  if (!upload) {
    return <Title>El documento no existe.</Title>;
  }

  return (
    <>
      {!upload.confirmed && <UploadedUnconfirmedPage upload={upload} />}
      {upload.confirmed && <UploadedConfirmedPage upload={upload} />}
    </>
  );
}
