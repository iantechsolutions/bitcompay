import { Title } from "~/components/title";
import { api } from "~/trpc/server";

import AffiliatePage from "./affliate-page";
import { checkRole } from "~/lib/utils/server/roles";

export default async function Page(props: {
  params: { affiliateId: string; companyId: string };
}) {
  const isAdmin = checkRole("admin");
  console.log(isAdmin);
  return (
    <AffiliatePage
      isAdmin={isAdmin}
      params={{
        affiliateId: props.params.affiliateId,
        companyId: props.params.companyId,
      }}
    />
  );
}
