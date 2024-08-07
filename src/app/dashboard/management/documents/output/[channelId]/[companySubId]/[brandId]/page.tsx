import { and, eq, inArray, not } from "drizzle-orm";
import { Title } from "~/components/title";
import { getBrandAndChannel } from "~/server/api/routers/iofiles-routers";
import { db, schema } from "~/server/db";
import { api } from "~/trpc/server";
import GenerateChannelOutputPage from "./generate-channel-output";
export default async function page({
  params,
}: {
  params: { channelId: string; companySubId: string; brandId: string };
}) {
  const company = await api.companies.getById.query({
    companyId: params.companySubId,
  });

  if (!company) {
    return <Title>company not found</Title>;
  }

  const { brand, channel } = await getBrandAndChannel(db, {
    companyId: company.id,
    channelId: params.channelId,
    brandId: params.brandId,
  });

  // Productos del canal
  const productsNumbers = channel.products.map((p) => p.product.number);

  // Pagos que no tienen archivo de salida que corresponden a la marca y los productos del canal
  const genFileStatus = await db.query.paymentStatus.findFirst({
    where: eq(schema.paymentStatus.code, "92"),
  });
  let payments = await db.query.payments.findMany({
    where: and(
      eq(schema.payments.companyId, company.id),
      eq(schema.payments.g_c, brand.number),
      inArray(schema.payments.product_number, productsNumbers) // Solo los productos de la marca y producto -> (los productos salen del canal)
    ),
  });

  payments = payments.filter((p) => !p.genChannels.includes(params.channelId));

  const outputFiles = await api.iofiles.list.query({
    channelId: params.channelId,
    companyId: params.companySubId,
    brandId: params.brandId,
  });

  // TODO: cambiar esto por un dict<status<record,amount>>
  const status_batch = [
    { status: "Pendiente", records: 0, amount_collected: 0 },
  ];
  for (const transaction of payments) {
    status_batch[0]!.records += 1;
    status_batch[0]!.amount_collected +=
      transaction?.collected_amount ?? transaction?.first_due_amount ?? 0;
  }

  return (
    <>
      {channel ? (
        <GenerateChannelOutputPage
          channel={channel}
          company={company}
          brand={brand}
          status_batch={status_batch}
          outputFiles={outputFiles}
        />
      ) : (
        <Title>Channel not found</Title>
      )}
    </>
  );
}
