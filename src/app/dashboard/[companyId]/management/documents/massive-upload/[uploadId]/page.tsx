import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
export default async function Home(props: {
  params: { uploadId: string; companyId: string };
}) {
  const data = await api.excelDeserialization.deserialization.mutate({
    type: "rec",
    id: props.params.uploadId,
    companyId: props.params.companyId,
  });
  function handleClick() {
    api.excelDeserialization.confirmData.mutate({
      type: "rec",
      uploadId: props.params.uploadId,
      companyId: props.params.companyId,
    });
  }
  console.log(data);
  return <div>
    <Button onClick={()=> handleClick}>Escribir a la base de datos</Button>
  </div>;
}
