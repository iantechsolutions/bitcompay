import AdminSidenav from '~/components/admin-sidenav'
import AppLayout from '~/components/applayout'

export default async function Layout(props: { children?: React.ReactNode }) {
    return (
        <AppLayout sidenavClass='top-[70px]' title={<h1>Administración</h1>} sidenav={<AdminSidenav />}>
            {props.children}
        </AppLayout>
    )
}
