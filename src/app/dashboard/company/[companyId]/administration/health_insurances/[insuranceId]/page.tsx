import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import InsurancePage from "./insurance-page";
export default async function Page(props: {
  params: { healthInsurance: string };
}) {
  const healthInsurance = await api.healthInsurances.get.query({
    healthInsuranceId: props.params.healthInsurance,
  });

  if (!healthInsurance) {
    return <Title>No se encontro la obra social</Title>;
  }
  return <InsurancePage insurance={healthInsurance}></InsurancePage>;
}
