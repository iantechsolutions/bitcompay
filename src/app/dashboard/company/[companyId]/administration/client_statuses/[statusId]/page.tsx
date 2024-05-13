import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import StatusPage from "./status-page";
export default async function Page(props: { params: { statusId: string } }) {
  const clientStatus = await api.clientStatuses.get.query({
    clientStatusId: props.params.statusId,
  });

  if (!clientStatus) {
    return <Title>No se encontro el estado</Title>;
  }
  return <StatusPage status={clientStatus}></StatusPage>;
}
