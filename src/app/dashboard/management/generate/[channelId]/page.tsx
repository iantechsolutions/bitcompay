import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { Building2Icon } from "lucide-react";
import { List, ListTile } from "~/components/list";
import { type RouterOutputs } from "~/trpc/shared";
export default async function Page(props: { params: { channelId: string } }) {
  const channel: RouterOutputs["channels"]["get"] =
    await api.channels.get.query({
      channelId: props.params.channelId,
    });

  const products: RouterOutputs["products"]["getByChannel"] =
    await api.products.getByChannel.query({
      channelId: props.params.channelId,
    });

  console.log(products);
  const companies = [];

  for (const product of products) {
    const companiesOfProduct: RouterOutputs["companies"]["getByProduct"] =
      await api.companies.getByProduct.query({
        productId: product.id,
      });
    if (companiesOfProduct) {
      if (companiesOfProduct) {
        for (const companyOfProduct of companiesOfProduct) {
          companies.push(companyOfProduct);
        }
      }
    }
  }
  if (!channel) {
    return <Title>Channel not found</Title>;
  }

  const companiesArray = [];
  const map: Record<string, boolean> = {};
  if (companies.length > 0) {
    for (const company of companies) {
      const key = company!.id!;
      if (!map[key]) {
        companiesArray.push(company);
        map[key] = true;
      }
    }
  }

  return (
    <>
      {companiesArray.length > 0 ? (
        <List>
          {companiesArray.map((company) => {
            return (
              <ListTile
                key={company?.id}
                href={`/dashboard/management/generate/${props.params.channelId}/${company?.id}`}
                title={company?.name}
                leading={<Building2Icon />}
              />
            );
          })}
        </List>
      ) : (
        <Title>No se encontro ninguna empresa para este canal de pago</Title>
      )}
    </>
  );
}
