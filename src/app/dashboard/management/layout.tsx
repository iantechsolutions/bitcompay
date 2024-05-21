import AppLayout from '~/components/applayout'
import ManagementSidenav from '~/components/management-sidenav'

export default async function Layout(props: {
    children?: React.ReactNode
    params?: { companyId: string }
}) {
    // TODO: chequear permisos

    return (
        <AppLayout title='Gestión' sidenavClass='top-[70px]' sidenav={<ManagementSidenav />}>
            {props.children}
        </AppLayout>
    )
}
