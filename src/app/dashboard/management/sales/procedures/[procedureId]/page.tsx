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
  const integrants = await api.integrants.getByGroup.query({
    family_group_id: family_group?.id,
  });
  if (!integrants) {
    throw new Error("No se encontraron integrantes");
  }
  const paymentHolder = integrants.filter(
    (integrant) => integrant.isPaymentHolder
  )![0];
  const pa = await api.pa.getByIntegrant.query({
    integrantId: paymentHolder!.id,
  });
  if (!pa) {
    throw new Error("No se encontro la informacion de pago");
  }
  return (
    <ProcedurePage
      pa={pa}
      integrants={integrants}
      procedure={procedure}
      family_group={family_group}
    />
  );
}
