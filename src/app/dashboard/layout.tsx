import { ArrowLeftIcon } from "lucide-react";
import AppLayout from "~/components/applayout";
import CompanySidenav from "~/components/company-sidenav";
import Sidenav, { SidenavItem } from "~/components/sidenav";
import { api } from "~/trpc/server";
import { CompanyProvider } from "./company-provider";
import { auth } from "@clerk/nextjs/server";

export default async function Layout(props: {
  children?: React.ReactNode;
}) {
  const { orgId } = auth();
  const company = await api.companies.get.query({
    companyId: orgId!,
  });

  // TODO: chequear acceso a la empresa

  return (
    <AppLayout
      headerClass="bg-[#e9fcf8]"
      sidenavClass="top-0"
      sidenav={<CompanySidenav companyId={company!.id!} />}
    >
      <CompanyProvider company={company}>{props.children}</CompanyProvider>
    </AppLayout>
  );
}
