import { Building2Icon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import type { RouterOutputs } from '~/trpc/shared'
export default async function Page(props: {
    params: { companyId: string; channelId: string }
}) {
    const channel: RouterOutputs['channels']['get'] = await api.channels.get.query({
        channelId: props.params.channelId,
    })
    const company: RouterOutputs['companies']['get'] = await api.companies.get.query({
        companyId: props.params.companyId,
    })
    const brands: RouterOutputs['brands']['getbyCompany'] = await api.brands.getbyCompany.query({
        companyId: props.params.companyId,
    })

    return (
        <>
            <div className='flex items-center font-semibold text-sm opacity-80'>
                {channel?.name} <ChevronRight /> {company?.name}
            </div>
            <Title>Elegir marca:</Title>
            <List>
                {brands.map((brand) => {
                    return (
                        <ListTile
                            key={brand?.id}
                            href={`/dashboard/management/generate/${props.params.channelId}/${props.params.companyId}/${brand?.id}`}
                            title={brand?.name}
                            leading={<Building2Icon />}
                        />
                    )
                })}
            </List>
        </>
    )
}
