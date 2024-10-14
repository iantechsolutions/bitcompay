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
  const nonClientoss = await api.healthInsurances.listNonClient.query()
  console.log(nonClientoss);
  const nonClientOs = nonClientoss.find((os) => os.id === props.params.osId);
  console.log("no cliente os ",nonClientOs);
  if (!nonClientOs) {
    return <Title>no se encontro obra social </Title>;
  }
  return (
    <NonOsPage healthInsurance={nonClientOs}/>
  )
}
