import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { Building2Icon } from "lucide-react";
import { List, ListTile } from "~/components/list";
import { type RouterOutputs } from "~/trpc/shared";

export default async function Page(props: {
  params: { companyId: string; channelId: string };
}) {
  const brands: RouterOutputs["brands"]["getbyCompany"] =
    await api.brands.getbyCompany.query({
      companyId: props.params.companyId,
    });

  return (
    <>
      <List>
        {brands.map((brand) => {
          return (
            <ListTile
              key={brand?.id}
              href={`/dashboard/management/generate/${props.params.channelId}/${props.params.companyId}/${brand?.id}`}
              title={brand?.name}
              leading={<Building2Icon />}
            />
          );
        })}
      </List>
    </>
  );
}
