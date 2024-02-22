
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { AddChannelDialog } from "./add-channel-dialog";
import LayoutContainer from "~/components/layout-container";
import { AddCompanyDialog } from "./add-company-dialog";
import { db } from "~/server/db";

export default async function Home() {
    const channels = await db.query.channels.findMany({})
    const companies = await db.query.companies.findMany({})
    return (
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
            <section className="space-y-2">
                <div className="flex justify-between">
                    <Title>Empresas</Title>
                    <AddCompanyDialog />
                </div>
                <List>
                    {companies.map(company => {
                        return <ListTile
                            href={`/dashboard/admin/global/companies/${company.id}`}
                            title={company.name}
                        />
                    })}
                </List>
            </section>
        </LayoutContainer>
    );
}