import { Title } from "~/components/title";
import CompanyPage from "./company-page";
import { api } from "~/trpc/server";

export default async function Channel(props: {
  params: { companyId: string };
}) {
  const session = await getServerAuthSession();


  const company = await api.companies.get.query({
    companyId: props.params.companyId,
  });

  const brandsData = company?.brands;

  const brands = brandsData?.map((brand) => {
    return brand.brand;
  });

  console.log(brands);
  const products = await api.products.list.query();

  if (!company || !session?.user) {
    return <Title>No se encontró la empresa</Title>;
  }

  return (
    <CompanyPage
      company={company}
      user={session.user}
      brands={brands}
      products={products}
    />
  );
}