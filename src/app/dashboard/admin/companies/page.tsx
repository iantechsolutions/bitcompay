import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import { AddCompanyDialog } from './add-company-dialog'

export default async function Home() {
    const companies = await api.companies.list.query()

    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Empresas</Title>
                    <AddCompanyDialog />
                </div>
                <List>
                    {companies.map((company) => {
                        return <ListTile key={company.id} href={`/dashboard/admin/companies/${company.id}`} title={company.name} />
                    })}
                </List>
            </section>
        </LayoutContainer>
    )
}
