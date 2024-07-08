import AppLayout from "~/components/applayout";
import CompanySidenav from "~/components/company-sidenav";
import { api } from "~/trpc/server";
import { CompanyProvider } from "./company-provider";
import { auth } from "@clerk/nextjs/server";
import { SetDefaultOrganization } from "./set-default-org";
import { checkRole } from "~/lib/utils/server/roles";

export default async function Layout(props: { children?: React.ReactNode }) {
  const { orgId } = auth();
  if (orgId || checkRole("admin")) {
    const company = await api.companies.get.query();

    return (
      <>
        <AppLayout
          headerClass="bg-[#e9fcf8]"
          sidenavClass="top-0"
          sidenav={<CompanySidenav />}
        >
          {company && (
            <CompanyProvider company={company}>
              {props.children}
            </CompanyProvider>
          )}
          {!company && checkRole("admin") && props.children}
        </AppLayout>
      </>
    );
  }
  return <SetDefaultOrganization />;
}
