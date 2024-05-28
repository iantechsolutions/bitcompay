import LayoutContainer from '~/components/layout-container'
import { List } from '~/components/list'
import { Title } from '~/components/title'

export default async function Page() {
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>Proveedores</Title>
                </div>
                <List />
            </section>
        </LayoutContainer>
    )
}
