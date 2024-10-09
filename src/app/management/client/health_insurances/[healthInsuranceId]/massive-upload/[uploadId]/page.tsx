import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import UnconfirmedPage from "./unconfirmed-page";

export default async function page(props: {
  params: { uploadId: string; healthInsuranceId: string };
}) {
  const upload = await api.excelDeserialization.upload.query({
    uploadId: props.params.uploadId,
  });

  const healthInsuranceId = props.params.healthInsuranceId;
  console.log("dedo", healthInsuranceId);
  if (!upload) {
    return <Title>El documento no existe.</Title>;
  }
  return (
    <UnconfirmedPage upload={upload} healthInsuranceId={healthInsuranceId} />
  );
}
