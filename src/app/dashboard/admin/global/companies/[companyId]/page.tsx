import AppSidenav from "~/components/app-sidenav";
import AppLayout from "~/components/applayout";
import { Title } from "~/components/title";
import { getServerAuthSession } from "~/server/auth";
import CompanyPage from "./company-page";
import { api } from "~/trpc/server";

export default async function Channel(props: { params: { companyId: string } }) {
    const session = await getServerAuthSession();

    const company = await api.companies.get.query({ companyId: props.params.companyId })
    const channels = await api.channels.getAll.query()

    if (!company || !session?.user) {
        return <AppLayout
            title={<h1>Error 404</h1>}
            user={session?.user}
            sidenav={<AppSidenav />}
        >
            <Title>No se encontró la empresa</Title>
        </AppLayout>
    }

    return <CompanyPage company={company} user={session.user} channels={channels} />
}