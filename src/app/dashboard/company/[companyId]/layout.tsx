import AppLayout from "~/components/applayout";
import CompanySidenav from "~/components/company-sidenav";
import { getServerAuthSession } from "~/server/auth";
import { CompanyProvider } from "./company-provider";
import { api } from "~/trpc/server";


export default async function Layout(props: { children?: React.ReactNode, params: { companyId: string } }) {
    const session = await getServerAuthSession();
    const company = await api.companies.get.query({ companyId: props.params.companyId })

    // TODO: chequear acceso a la empresa

    return <AppLayout
        title={company?.name || '404 NOT FOUND'}
        user={session?.user}
        sidenav={<CompanySidenav />}
    >
        <CompanyProvider company={company}>
            {props.children}
        </CompanyProvider>
    </AppLayout>
}