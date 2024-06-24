import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import CompanyPage from "./company-page";
import { getServerAuthSession } from "~/server/auth";

export default async function Channel(props: {
  params: { companySubId: string };
}) {
  const session = getServerAuthSession();
  console.log("session", session);
  const company = await api.companies.get.query({
    companyId: props.params.companySubId,
  });

  const brandsData = company?.brands;

  const brands = brandsData?.map((brand) => {
    return brand.brand;
  });
  const products = await api.products.list.query();

  if (!company) {
    return <Title>No se encontró la empresa</Title>;
  }

  return <CompanyPage company={company} brands={brands} products={products} />;
}
