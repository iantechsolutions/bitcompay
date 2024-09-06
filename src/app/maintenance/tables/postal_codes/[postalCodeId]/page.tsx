import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import PostalCodePage from "./postal-code-page";

export default async function Page(props: {
  params: { postalCodeId: string };
}) {
  const postalCodeId = props.params.postalCodeId;
  console.log(postalCodeId);
  const postalCode = await api.postal_code.get.query({
    postalCodeId,
  });

  if (!postalCode) {
    return <Title>No se encontraron las unidades de negocio</Title>;
  }

  return <PostalCodePage postalCode={postalCode} />;
}
