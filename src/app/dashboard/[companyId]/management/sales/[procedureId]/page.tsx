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

  const family_group = await api.family_groups.getbyProcedure.query({
    procedureId: procedure?.id,
  });
  if (!family_group) {
    throw new Error("No se encontro el grupo familiar");
  }
  const Integrantes = await api.integrants.getByGroup.query({
    family_group_id: family_group?.id,
  });
  if (!Integrantes) {
    throw new Error("No se encontraron integrantes");
  }
  return <ProcedurePage procedure={procedure} family_group={family_group} />;
}
