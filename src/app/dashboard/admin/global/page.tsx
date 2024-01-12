
import AppLayout from "~/components/applayout";
import { getServerAuthSession } from "~/server/auth";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import AppSidenav from "~/components/app-sidenav";
import { db } from "~/server/db";
import { AddChannelDialog } from "./add-channel-dialog";
import LayoutContainer from "~/components/layout-container";

export default async function Home() {
    const session = await getServerAuthSession();

    const channels = await db.query.channels.findMany({})

    return (
        <AppLayout
            title={<h1>Configuraciones del sistema</h1>}
            user={session?.user}
            sidenav={<AppSidenav />}
        >
            <LayoutContainer>
                <section className="space-y-2">
                    <div className="flex justify-between">
                        <Title>Canales</Title>
                        <AddChannelDialog />
                    </div>
                    <List>
                        {channels.map(channel => {
                            return <ListTile
                                href={`/dashboard/admin/global/channels/${channel.id}`}
                                leading={channel.number}
                                title={channel.name}
                            />
                        })}
                    </List>
                </section>
            </LayoutContainer>
        </AppLayout>
    );
}