import AppLayout from "~/components/applayout";
import ManagementSidenav from "~/components/management-sidenav";
import { getServerAuthSession } from "~/server/auth";

export default async function Layout(props: { children?: React.ReactNode, params?: { companyId: string } }) {
    const session = await getServerAuthSession();

    // TODO: chequear permisos

    return <AppLayout
        title="Gestión"
        user={session?.user}
        sidenav={<ManagementSidenav />}
    >
        {props.children}
    </AppLayout>
}