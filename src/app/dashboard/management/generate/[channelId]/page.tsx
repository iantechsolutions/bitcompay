import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { Building2Icon } from "lucide-react";
import { List, ListTile } from "~/components/list";
export default async function Page(props: { params: { channelId: string } }) {
  const channel = await api.channels.get.query({
    channelId: props.params.channelId,
  });

  const products = await api.products.getByChannel.query({
    channelId: props.params.channelId,
  });

  const companies = [];

  for (const product of products) {
    const companiesOfProduct = await api.companies.getByProduct.query({
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

  return (
    <>
      <List>
        {companies.map((company) => {
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
    </>
  );
}
