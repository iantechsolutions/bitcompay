import { Building2Icon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import type { RouterOutputs } from "~/trpc/shared";
export default async function Page(props: {
  params: { companySubId: string; channelId: string };
}) {
  const channel: RouterOutputs["channels"]["get"] =
    await api.channels.get.query({
      channelId: props.params.channelId,
    });
  const company: RouterOutputs["companies"]["getById"] =
    await api.companies.getById.query({
      companyId: props.params.companySubId,
    });
  const brands: RouterOutputs["brands"]["list"] = await api.brands.list.query();

  console.log(brands);
  return (
    <>
      <div className="flex items-center text-sm font-semibold opacity-80">
        {channel?.name} <ChevronRight /> {company?.name}
      </div>
      <Title>Elegir marca:</Title>
      <List>
        {brands?.map((brand) => {
          return (
            <ListTile
              key={brand?.id}
              href={`/dashboard/management/documents/output/${props.params.channelId}/${props.params.companySubId}/${brand?.id}`}
              title={brand?.name}
              leading={<Building2Icon />}
            />
          );
        })}
      </List>
    </>
  );
}
