import { NotepadText } from 'lucide-react'
import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'

export default async function Page(props: { params: { companyId: string } }) {
    const clientStatuses = await api.clientStatuses.list.query()
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Estados</Title>
                </div>
                <List>
                    {clientStatuses.map((status) => {
                        return (
                            <ListTile
                                key={status.id}
                                href={`/dashboard/company/${props.params.companyId}/administration/healthInsurances/${status.id}`}
                                title={status.description}
                                leading={<NotepadText />}
                            />
                        )
                    })}
                </List>
            </section>
        </LayoutContainer>
    )
}
