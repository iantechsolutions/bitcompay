import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import NonOsPage from "./health-insurance-page";

interface Props {
  params: {
    osId: string;
  };
}
export default async function Page(props: Props) {
  const nonClientOs = await api.healthInsurances.get.query({
    healthInsuranceId: props.params.osId,
  });
  if (nonClientOs) {
    return <Title>no se encontro obra social </Title>;
  }
  return (
    <NonOsPage healthInsurance={nonClientOs}/>
  )
}
