import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import CompanyPage from './company-page'

export default async function Channel(props: {
    params: { companyId: string }
}) {
    const company = await api.companies.get.query({
        companyId: props.params.companyId,
    })

    const brandsData = company?.brands

    const brands = brandsData?.map((brand) => {
        return brand.brand
    })

    const products = await api.products.list.query()

    if (!company) {
        return <Title>No se encontró la empresa</Title>
    }

    return <CompanyPage company={company} brands={brands} products={products} />
}
