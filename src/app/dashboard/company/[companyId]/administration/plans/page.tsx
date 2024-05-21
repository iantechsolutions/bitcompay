import { NotepadText } from 'lucide-react'
import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import AddPlanDialog from './add-plan-dialog'

export default async function Page(props: { params: { companyId: string } }) {
    const plans = await api.plans.list.query()
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Planes</Title>
                    <AddPlanDialog />
                </div>
                <List>
                    {plans.map((plan) => {
                        return (
                            <ListTile
                                key={plan.id}
                                href={`/dashboard/company/${props.params.companyId}/administration/plans/${plan.id}`}
                                title={plan.description}
                                leading={<NotepadText />}
                            />
                        )
                    })}
                </List>
            </section>
        </LayoutContainer>
    )
}
