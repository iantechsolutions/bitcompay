import AppSidenav from "~/components/admin-sidenav";
import AppLayout from "~/components/applayout";
import { Title } from "~/components/title";
import { getServerAuthSession } from "~/server/auth";
import CompanyPage from "./company-page";
import { api } from "~/trpc/server";

export default async function Channel(props: { params: { companyId: string } }) {
    const session = await getServerAuthSession();

    const company = await api.companies.get.query({ companyId: props.params.companyId })
    const channels = await api.channels.list.query()

    if (!company || !session?.user) {
        return <Title>No se encontró la empresa</Title>
    }

    return <CompanyPage company={company} user={session.user} channels={channels} />
}