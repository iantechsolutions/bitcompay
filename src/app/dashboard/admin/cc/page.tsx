import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'

import { api } from '~/trpc/server'

export default async function Home() {
    const transactions = await api.transactions.list.query()
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Cuenta corriente</Title>
                </div>
                <List>
                    {transactions.map((transactions) => {
                        return (
                            <ListTile
                                key={transactions.id}
                                leading={transactions.cbu}
                                href={`/dashboard/admin/products/${transactions.id}`}
                                title={transactions.name}
                            />
                        )
                    })}
                </List>
            </section>
        </LayoutContainer>
    )
}
