import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import { AddModo } from './add-modo'

export default async function Home() {
    const modo = await api.modos.list.query()
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>modos</Title>
                    <AddModo />
                </div>
                <List>
                    {modo.map((modo) => {
                        return (
                            <ListTile
                                key={modo.id}
                                leading={modo.description}
                                href={`/dashboard/admin/modos/${modo.id}`}
                                title={modo.description}
                            />
                        )
                    })}
                </List>
            </section>
        </LayoutContainer>
    )
}
