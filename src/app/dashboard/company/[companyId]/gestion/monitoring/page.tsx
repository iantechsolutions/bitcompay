import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'

export default async function Page(props: { params: { companyId: string } }) {
    const uploads = await api.uploads.list.query()
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Monitoreo</Title>
                </div>
                <List>
                    {uploads.map((uploads) => (
                        <ListTile
                            key={uploads.id}
                            href={`/dashboard/company/${props.params.companyId}/administration/bussiness_units/${uploads.id}`}
                            title={uploads.fileName}
                        />
                    ))}
                </List>
            </section>
        </LayoutContainer>
    )
}
