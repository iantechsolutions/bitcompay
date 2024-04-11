import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import GenerateChannelOutputPage from "./generate-channel-output";
export default async function page({
  params,
}: {
  params: { channelId: string; companyId: string };
}) {
  const company = await api.companies.get.query({
    companyId: params.companyId,
  });
  const channel = await api.channels.get.query({
    channelId: params.channelId,
  });

  if (!company) {
    return <Title>company not found</Title>;
  }

  return (
    <>
      {channel ? (
        <GenerateChannelOutputPage channel={channel} company={company} />
      ) : (
        <Title>Channel not found</Title>
      )}
    </>
  );
}
