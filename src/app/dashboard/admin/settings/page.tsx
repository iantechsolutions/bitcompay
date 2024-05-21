import AppSidenav from '~/components/admin-sidenav'
import AppLayout from '~/components/applayout'
import { Button } from '~/components/ui/button'

export default function Home() {
    return (
        <AppLayout sidenavClass='top-[70px]' title={<h1>Configuraciones del sistema</h1>} sidenav={<AppSidenav />}>
            <div className='mb-10 flex justify-center'>
                <Button>Opciones</Button>
            </div>
            <div />
        </AppLayout>
    )
}
