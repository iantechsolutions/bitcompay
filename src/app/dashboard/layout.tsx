import AppLayout from "~/components/applayout";
import CompanySidenav from "~/components/company-sidenav";
import { api } from "~/trpc/server";
import { CompanyProvider } from "./company-provider";
import { auth } from "@clerk/nextjs/server";
import { SetDefaultOrganization } from "./set-default-org";
import AccessDenied from "../accessdenied/page";

export default async function Layout(props: { children?: React.ReactNode }) {
  const { orgId } = auth();
  if (orgId) {
    const company = await api.companies.get.query({
      companyId: orgId!,
    });

    return (
      <>
        <AppLayout
          headerClass="bg-[#e9fcf8]"
          sidenavClass="top-0"
          sidenav={<CompanySidenav companyId={company!.id!} />}
        >
          <CompanyProvider company={company}>{props.children}</CompanyProvider>
        </AppLayout>
      </>
    );
  }
  if (!orgId) {
    return <SetDefaultOrganization />;
  }
}
