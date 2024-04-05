import AppSidenav from "~/components/admin-sidenav";
import AppLayout from "~/components/applayout";
import { Title } from "~/components/title";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import BrandPage from "./brand-page";

export default async function Brand(props: { params: { brandId: string } }) {
  const session = await getServerAuthSession();

  const brand = await api.brands.get.query({ brandId: props.params.brandId });

  const companiesData = brand?.company;

  const companiesRelated = companiesData?.map((company) => {
    return company.company;
  });

  const unrelatedCompanies = await api.companies.getUnrelated.query({
    brandId: props.params.brandId,
  });

  if (!brand || !session?.user) {
    return <Title>No se encontró la marca</Title>;
  }

  return (
    <BrandPage
      brand={brand}
      companies={companiesRelated}
      unrelatedCompanies={unrelatedCompanies}
    />
  );
}
