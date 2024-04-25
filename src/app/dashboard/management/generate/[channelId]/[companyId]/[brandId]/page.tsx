import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import GenerateChannelOutputPage from "./generate-channel-output";
export default async function page({
  params,
}: {
  params: { channelId: string; companyId: string; brandId: string };
}) {
  const company = await api.companies.get.query({
    companyId: params.companyId,
  });
  const channel = await api.channels.get.query({
    channelId: params.channelId,
  });

  const brand = await api.brands.get.query({
    brandId: params.brandId,
  });

  if (!company) {
    return <Title>company not found</Title>;
  }

  if (!brand) {
    return <Title>brand nout found</Title>;
  }

  return (
    <>
      {channel ? (
        <GenerateChannelOutputPage
          channel={channel}
          company={company}
          brand={brand}
        />
      ) : (
        <Title>Channel not found</Title>
      )}
    </>
  );
}
