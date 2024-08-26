import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import HealthInsurancePage from "./health_insurance-page";

export default async function Page(props: {
  params: { healthInsuranceId: string };
}) {
  const { healthInsuranceId } = props.params;

  // Fetch the plan using the companyId and planId
  const healthInsurance = await api.healthInsurances.getWithComprobantes.query({
    healthInsuranceId,
  });

  if (!healthInsurance) {
    return <Title>No se encontró el obra social</Title>;
  }

  return (
    <HealthInsurancePage
      healthInsurance={healthInsurance}
      ccId={healthInsurance?.cc?.id}
      healthInsuranceId={healthInsuranceId}
    />
  );
}
