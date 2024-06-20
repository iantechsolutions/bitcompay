import { Title } from "~/components/title";
import { api } from "~/trpc/server";

import AffiliatePage from "./affliate-page";

export default async function Page(props: {
  params: { affiliateId: string; companyId: string };
}) {
  return (
    <AffiliatePage
      params={{
        affiliateId: props.params.affiliateId,
        companyId: props.params.companyId,
      }}
    />
  );
}
