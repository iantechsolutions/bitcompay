import AdminSidenav from "~/components/admin-sidenav";
import AppLayout from "~/components/applayout";
import { getServerAuthSession } from "~/server/auth";

export default async function Layout(props: { children?: React.ReactNode }) {
    const session = await getServerAuthSession();

    return <AppLayout
        title={<h1>Administración</h1>}
        user={session?.user}
        sidenav={<AdminSidenav />}
    >
        {props.children}
    </AppLayout>
}