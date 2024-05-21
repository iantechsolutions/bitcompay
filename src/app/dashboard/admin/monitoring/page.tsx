import LayoutContainer from '~/components/layout-container'
import { Title } from '~/components/title'

export default async function Home() {
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Monitoreo dinamico</Title>
                </div>
            </section>
        </LayoutContainer>
    )
}
