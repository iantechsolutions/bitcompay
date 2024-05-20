import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import ProcedurePage from "./procedure-page";

export default async function Home(props: { params: { procedureId: string } }) {
  const procedure = await api.procedure.get.query({
    procedureId: props.params.procedureId,
  });

  if (!procedure) {
    return <Title>El documento no existe.</Title>;
  }

  return <ProcedurePage procedure={procedure} />;
}
