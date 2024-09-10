import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import BrandPage from './brand-page'

export default async function Brand(props: { params: { brandId: string } }) {
    const brand = await api.brands.get.query({ brandId: props.params.brandId })

    const allCompanies = await api.companies.list.query()

    const relatedCompanies = await api.companies.getRelated.query({
        brandId: props.params.brandId,
    })

    if (!brand) {
        return <Title>No se encontró la marca</Title>
    }

    return <BrandPage brand={brand} companies={allCompanies} relatedCompanies={relatedCompanies} />
}
