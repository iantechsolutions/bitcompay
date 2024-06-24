import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import UnconfirmedPage from "./unconfirmed-page";

export const maxDuration = 60;

export default async function page(props: {
  params: { uploadId: string; companyId: string };
}) {
  const upload = await api.excelDeserialization.upload.query({
    uploadId: props.params.uploadId,
  });
  if (!upload) {
    return <Title>El documento no existe.</Title>;
  }
  return <UnconfirmedPage upload={upload} companyId={props.params.companyId} />;
}
