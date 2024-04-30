import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { db, schema } from "~/server/db";
import { eq, and } from "drizzle-orm";
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
  const productsChannels = await db.query.productChannels.findMany({
    where: eq(schema.productChannels.channelId, params.channelId),
  });

  const transactions = [];
  for (const relation of productsChannels) {
    const product = await db.query.products.findFirst({
      where: eq(schema.products.id, relation.productId),
    });

    if (!product) {
      throw new Error("product or channel does not exist in company");
    }

    const t = await db
      .select()
      .from(schema.payments)
      .where(
        and(
          eq(schema.payments.product_number, product.number),
          eq(schema.payments.companyId, params.companyId),
          eq(schema.payments.status_code, "91"),
        ),
      );

    for (const item of t) {
      transactions.push(item);
    }
  }
  //despues cambiar esto por un dict<status<record,amount>>
  const status_batch = [
    { status: "Pendiente", records: 0, amount_collected: 0 },
  ];
  for (const transaction of transactions) {
    if (transaction.status_code === "91") {
      status_batch[0]!.records += 1;
      status_batch[0]!.amount_collected +=
        transaction?.collected_amount ?? transaction?.first_due_amount ?? 0;
    }
  }
  return (
    <>
      {channel ? (
        <GenerateChannelOutputPage
          channel={channel}
          company={company}
          brand={brand}
          status_batch={status_batch}
        />
      ) : (
        <Title>Channel not found</Title>
      )}
    </>
  );
}
