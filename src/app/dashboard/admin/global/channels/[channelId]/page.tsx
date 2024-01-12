import { eq } from "drizzle-orm";
import AppSidenav from "~/components/app-sidenav";
import AppLayout from "~/components/applayout";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { Switch } from "~/components/ui/switch";
import { getServerAuthSession } from "~/server/auth";
import { db, schema } from "~/server/db";
import { recHeaders } from "~/server/uploads/validators";

export default async function Channel(props: { params: { channelId: string } }) {
    const session = await getServerAuthSession();

    const channel = await db.query.channels.findFirst({
        where: eq(schema.channels.id, props.params.channelId)
    })

    if (!channel) {
        return <AppLayout
            title={<h1>Error 404</h1>}
            user={session?.user}
            sidenav={<AppSidenav />}
        >
            <Title>No se encontró el canal</Title>
        </AppLayout>
    }

    return <AppLayout
        title={<h1>{channel.number} - {channel.name}</h1>}
        user={session?.user}
        sidenav={<AppSidenav />}
    >
        <LayoutContainer>
            <section className="space-y-2">
                <Title>Columnas obligatorias</Title>

                <List>
                    {recHeaders.map(header => {

                        return <ListTile
                            title={header.label}
                            subtitle={header.key}
                            trailing={<Switch
                                checked={header.alwaysRequired || undefined}
                            />}
                        />
                    })}
                </List>
            </section>
        </LayoutContainer>
    </AppLayout>
}