"use client"

import { CheckIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import AppSidenav from "~/components/app-sidenav"
import AppLayout from "~/components/applayout"
import LayoutContainer from "~/components/layout-container"
import { List, ListTile } from "~/components/list"
import { NavUserData } from "~/components/nav-user-section"
import { Title } from "~/components/title"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { asTRPCError } from "~/lib/errors"
import { recHeaders } from "~/server/uploads/validators"
import { api } from "~/trpc/react"
import { RouterOutputs } from "~/trpc/shared"

export default function ChannelPage({ channel, user }: {
    channel: NonNullable<RouterOutputs['channels']['get']>,
    user: NavUserData
}) {
    const [requiredColumns, setRequiredColumns] = useState<Set<string>>(new Set(channel.requiredColumns))

    function changeRequiredColumn(key: string, required: boolean) {
        if (required) {
            requiredColumns.add(key)
        } else {
            requiredColumns.delete(key)
        }
        setRequiredColumns(new Set(requiredColumns))
    }

    const { mutateAsync: changeChannel, isLoading } = api.channels.change.useMutation()

    async function handleChange() {
        try {
            await changeChannel({
                channelId: channel.id,
                requiredColumns: Array.from(requiredColumns)
            })
            toast.success('Se han guardado los cambios')
        } catch (e) {
            const error = asTRPCError(e)!
            toast.error(error.message)
        }
    }

    return <AppLayout
        title={<h1>{channel.number} - {channel.name}</h1>}
        user={user}
        sidenav={<AppSidenav />}
    >
        <LayoutContainer>
            <section className="space-y-2">
                <div className="flex justify-between">
                    <Title>Columnas obligatorias</Title>
                    <Button
                        disabled={isLoading}
                        onClick={handleChange}
                    >
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <CheckIcon className="mr-2" />}
                        Aplicar
                    </Button>
                </div>

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