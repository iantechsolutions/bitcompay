import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import { AddChannelDialog } from './add-channel-dialog'

export default async function Home() {
    const channels = await api.channels.list.query()
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Canales</Title>
                    <AddChannelDialog />
                </div>
                <List>
                    {channels.map((channel) => {
                        return (
                            <ListTile
                                key={channel.id}
                                href={`/dashboard/admin/channels/${channel.id}`}
                                leading={channel.number}
                                title={channel.name}
                            />
                        )
                    })}
                </List>
            </section>
        </LayoutContainer>
    )
}
