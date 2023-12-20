
import AppLayout from "~/components/applayout";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import { getRoles } from "~/server/permissions";
import { Title } from "~/components/title";
import { PlusCircleIcon, UserIcon } from "lucide-react";
import { topRightAbsoluteOnDesktopClassName } from "~/lib/utils";
import { List, ListTile } from "~/components/list";
import AppSidenav from "~/components/app-sidenav";

export default async function Home() {
    const session = await getServerAuthSession();
    const roles = await getRoles()

    return (
        <AppLayout
            title={<h1>Configuraciones del sistema</h1>}
            user={session?.user}
            sidenav={<AppSidenav />}
        >
            <Title>Roles y permisos</Title>
            <List>
                {roles.map(role => <ListTile
                    title={<p>{role.name}</p>}
                    subtitle={<ul>
                        {role.permissions.map(permission => <li key={permission}>{permission}</li>)}
                    </ul>}
                />)}
            </List>
            <Button className={topRightAbsoluteOnDesktopClassName}>
                <PlusCircleIcon className="mr-2" size={20} /> Crear nuevo rol
            </Button>
        </AppLayout>
    );
}