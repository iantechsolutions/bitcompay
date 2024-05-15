import { api } from "~/trpc/server";
import { Title } from "~/components/title";

import ModoPage from "./modo-page"; 

export default async function Page(props: { params: { modosId: string } }) {
  const { modosId } = props.params;

  // Fetch the plan using the companyId and planId
  const modo = await api.modos.get.query({
    modosId
  });

  if (!modo) {
    return <Title>No se encontró el modo</Title>;
  }

  return <ModoPage modo={modo} />;
}
