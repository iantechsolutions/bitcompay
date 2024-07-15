"use server";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import CompanyPage from "./company-page";
import { clerkClient } from "@clerk/nextjs/server";
import { UserList } from "~/lib/types/clerk";
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
  const userList: UserList = [];
  const response =
    await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: props.params.companySubId,
    });
  if (response.data?.length > 0) {
    for (const user of response.data) {
    }
  }
  console.log(userList);
  if (!company || !response) {
    return <Title>No se encontró la entidad</Title>;
  }

  return (
    <CompanyPage
      company={company}
      brands={brands}
      products={products}
      userList={[]}
    />
  );
}
