import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { Building2Icon } from "lucide-react";
import { List, ListTile } from "~/components/list";
import { type RouterOutputs } from "~/trpc/shared";
import { ChevronRight } from "lucide-react";
export default async function Page(props: {
  params: { companyId: string; companySubId: string; channelId: string };
}) {
  const channel: RouterOutputs["channels"]["get"] =
    await api.channels.get.query({
      channelId: props.params.channelId,
    });
  const company: RouterOutputs["companies"]["get"] =
    await api.companies.get.query({
      companyId: props.params.companySubId,
    });
  const brands: RouterOutputs["brands"]["getbyCompany"] =
    await api.brands.getbyCompany.query({
      companyId: props.params.companySubId,
    });

  return (
    <>
      <div className="flex items-center text-sm font-semibold opacity-80">
        {channel?.name} <ChevronRight /> {company?.name}
      </div>
      <Title>Elegir marca:</Title>
      <List>
        {brands.map((brand) => {
          return (
            <ListTile
              key={brand?.id}
              href={`/dashboard/${props.params.companyId}/management/documents/output/${props.params.channelId}/${props.params.companySubId}/${brand?.id}`}
              title={brand?.name}
              leading={<Building2Icon />}
            />
          );
        })}
      </List>
    </>
  );
}
