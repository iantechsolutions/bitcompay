import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import ZonePage from "./zone-page";

export default async function Page(props: { params: { ZoneId: string } }) {
  const zoneId = props.params.ZoneId;

  const zone = await api.zone.get.query({
    zoneId,
  });

  if (!zone) {
    return <Title>No se encontraron las unidades de negocio</Title>;
  }

  return <ZonePage zone={zone} />;
}
