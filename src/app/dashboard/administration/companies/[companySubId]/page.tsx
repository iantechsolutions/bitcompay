import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import CompanyPage from "./company-page";
export default async function Page(props: {
  params: { companySubId: string };
}) {
  const company = await api.companies.getById.query({
    companyId: props.params.companySubId,
  });

  const brandsData = company?.brands;

  const brands = brandsData?.map((brand) => {
    return brand.brand;
  });
  const products = await api.products.list.query();

  if (!company) {
    return <Title>No se encontró la entidad</Title>;
  }

  return <CompanyPage company={company} brands={brands} products={products} />;
}
