import { api } from "~/trpc/server";

export default async function Home(props: {
  params: { uploadId: string; companyId: string };
}) {
  const data = await api.excelDeserialization.deserialization.mutate({
    type: "rec",
    id: props.params.uploadId,
    companyId: props.params.companyId,
  });
  console.log(data);
  return <div></div>;
}
