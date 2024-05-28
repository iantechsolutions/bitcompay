import { Building2Icon, LayoutDashboardIcon, Settings2Icon } from 'lucide-react'
import AppLayout from '~/components/applayout'
import { List, ListTile } from '~/components/list'
import Sidenav, { SidenavItem } from '~/components/sidenav'
import { Title } from '~/components/title'
import { Button } from '~/components/ui/button'
import { api } from '~/trpc/server'

export default async function Home() {
    const companies = await api.companies.list.query()

    return (
        <AppLayout
            title={<h1>BITCOMPAY</h1>}
            sidenavClass='top-[70px]'
        >
            <div className='flex justify-between'>
                <Title>Ingresar como empresa</Title>
                <Button>Gestionar</Button>
            </div>
            <List>
                {companies.map((company) => {
                    return (
                        <ListTile
                            key={company.id}
                            href={`/dashboard/${company.id}/general`}
                            title={company.name}
                            leading={<Building2Icon />}
                        />
                    )
                })}
            </List>
        </AppLayout>
    )
}
