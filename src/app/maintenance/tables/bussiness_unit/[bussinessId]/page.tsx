import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import EditBusinessUnit from "./bussiness-page";

export default async function Page(props: {
  params: { companyId: string; bussinessId: string };
}) {
  const bussinessUnit = await api.bussinessUnits.get.query({
    bussinessUnitId: props.params.bussinessId,
  });
  const companyId = props.params.companyId;
  const bussinessId = props.params.bussinessId;

  if (!bussinessUnit) {
    return <Title>No se encontraron las unidades de negocio</Title>;
  }

  return (
    <EditBusinessUnit
      businessUnit={bussinessUnit}
      params={{ companyId: companyId, unitId: bussinessId }}
    />
  );
}
