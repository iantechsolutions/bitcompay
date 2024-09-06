import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import EstablishmentPage from "./establishment-page";

export default async function Page(props: {
  params: { companyId: string; establishmentId: string };
}) {
  const establishment = await api.establishments.get.query({
    establishmentId: props.params.establishmentId,
  });

  const companyId = props.params.companyId;

  if (!establishment) {
    return <Title>No se encontraro el establecimiento</Title>;
  }

  return <EstablishmentPage establishment={establishment} />;
}
