import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import { AddStatusDialog } from './add-status-dialog'

export default async function StatusPage() {
    const statuses = await api.status.list.query()

    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Estados de Transacción</Title>
                    <AddStatusDialog />
                </div>
                <List>
                    {statuses.map((status) => {
                        return (
                            <ListTile
                                leading={status.code}
                                key={status.id}
                                href={`/dashboard/admin/statuses/${status.id}`}
                                title={status.description}
                            />
                        )
                    })}
                </List>
            </section>
        </LayoutContainer>
    )
}
