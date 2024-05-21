import { NotepadText } from 'lucide-react'
import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import AddInsuranceDialog from './add-insurance-dialog'
export default async function Page(props: { params: { companyId: string } }) {
    const healthInsurances = await api.healthInsurances.list.query()
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Obras sociales</Title>
                    <AddInsuranceDialog />
                </div>
                <List>
                    {healthInsurances.map((insurance) => {
                        return (
                            <ListTile
                                key={insurance.id}
                                href={`/dashboard/company/${props.params.companyId}/administration/healthInsurances/${insurance.id}`}
                                title={insurance.name}
                                leading={<NotepadText />}
                            />
                        )
                    })}
                </List>
            </section>
        </LayoutContainer>
    )
}
