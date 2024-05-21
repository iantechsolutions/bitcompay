import LayoutContainer from '~/components/layout-container'
import { Title } from '~/components/title'

export default async function Page(_props: { params: { companyId: string } }) {
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Soporte</Title>
                </div>
            </section>
        </LayoutContainer>
    )
}
