"use client"

import { useState } from "react"
import AppSidenav from "~/components/app-sidenav"
import AppLayout from "~/components/applayout"
import LayoutContainer from "~/components/layout-container"
import { List, ListTile } from "~/components/list"
import { NavUserData } from "~/components/nav-user-section"
import { Title } from "~/components/title"
import { Switch } from "~/components/ui/switch"
import { recHeaders } from "~/server/uploads/validators"
import { RouterOutputs } from "~/trpc/shared"

export default function ChannelPage({ channel, user }: {
    channel: NonNullable<RouterOutputs['channels']['get']>,
    user: NavUserData
}) {
    const [requiredColumns, setRequiredColumns] = useState<Set<string>>(new Set())

    function changeRequiredColumn(key: string, required: boolean) {
        if (required) {
            requiredColumns.add(key)
        } else {
            requiredColumns.delete(key)
        }
        setRequiredColumns(new Set(requiredColumns))
    }


    return <AppLayout
        title={<h1>{channel.number} - {channel.name}</h1>}
        user={user}
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
                                disabled={header.alwaysRequired}
                                checked={header.alwaysRequired || requiredColumns.has(header.key)}
                                onCheckedChange={required => changeRequiredColumn(header.key, required)}
                            />}
                        />
                    })}
                </List>
            </section>
        </LayoutContainer>
    </AppLayout>
}