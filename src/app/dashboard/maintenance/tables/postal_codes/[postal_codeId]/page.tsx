import PlanPage from "./postal-code-page";

export default async function Page(props: {
  params: { postalCodeId: string };
}) {
  const postalCode = props.params.postalCodeId;

  return <PlanPage postalCode={postalCode} />;
}
