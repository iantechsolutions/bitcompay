import { Title } from "~/components/title";
import CompanyPage from "./company-page";
import { api } from "~/trpc/server";

export default async function Channel(props: { params: { companyId: string } }) {

    const company = await api.companies.get.query({ companyId: props.params.companyId })
    const products = await api.products.list.query()

    if (!company) {
        return <Title>No se encontró la empresa</Title>
    }

    return <CompanyPage company={company} products={products} />
}