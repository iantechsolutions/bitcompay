import { Title } from '~/components/title'
import { api } from '~/trpc/server'

import PlanPage from './plan-page'

export default async function Page(props: { params: { planId: string } }) {
    const { planId } = props.params

    // Fetch the plan using the companyId and planId
    const plan = await api.plans.get.query({
        planId,
    })

    if (!plan) {
        return <Title>No se encontró el plan</Title>
    }

    return <PlanPage plan={plan} />
}
