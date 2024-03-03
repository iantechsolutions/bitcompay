"use client"

import { CheckIcon, Loader2 } from "lucide-react"
import { MouseEventHandler, useState } from "react"
import { toast } from "sonner"
import AppSidenav from "~/components/admin-sidenav"
import AppLayout from "~/components/applayout"
import LayoutContainer from "~/components/layout-container"
import { List, ListTile } from "~/components/list"
import { NavUserData } from "~/components/nav-user-section"
import { Title } from "~/components/title"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { asTRPCError } from "~/lib/errors"
import { recHeaders } from "~/server/uploads/validators"
import { api } from "~/trpc/react"
import { RouterOutputs } from "~/trpc/shared"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/ui/accordion"
import { Card } from "~/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export default function ChannelPage({ channel, user }: {
    channel: NonNullable<RouterOutputs['channels']['get']>,
    user: NavUserData
}) {
    const [requiredColumns, setRequiredColumns] = useState<Set<string>>(new Set(channel.requiredColumns))
    const [name, setName] = useState(channel.name)
    const [number, setNumber] = useState(channel.number.toString())
    const [description, setDescription] = useState(channel.description)

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
                requiredColumns: Array.from(requiredColumns),
                name,
                number: parseInt(number),
                description,
            })
            toast.success('Se han guardado los cambios')
        } catch (e) {
            const error = asTRPCError(e)!
            toast.error(error.message)
        }
    }

    return <LayoutContainer>
        <section className="space-y-2">
            <div className="flex justify-between">
                <Title>{channel.number} - {channel.name}</Title>
                <Button
                    disabled={isLoading}
                    onClick={handleChange}
                >
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <CheckIcon className="mr-2" />}
                    Aplicar
                </Button>
            </div>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <h2 className="text-md">Columnas obligatorias</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <List>
                            {recHeaders.map(header => {
                                return <ListTile
                                    key={header.key}
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
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>
                        <h2 className="text-md">Info. del canal</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <Card className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="number">Número</Label>
                                    <Input id="number" type="number" value={number} onChange={e => setNumber(e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                            </div>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>
                        <h2 className="text-md">Productos con este canal habilitado</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <List>
                            {channel.products.map(({ product }) => {
                                return <ListTile
                                    key={product.id}
                                    href={`/dashboard/admin/products/${product.id}`}
                                    title={product.name}
                                />
                            })}
                        </List>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-none">
                    <AccordionTrigger>
                        <h2 className="text-md">Eliminar canal</h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="flex justify-end">
                            <DeleteChannel channelId={channel.id} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    </LayoutContainer>
}


function DeleteChannel(props: { channelId: string }) {
    const { mutateAsync: deleteChannel, isLoading } = api.channels.delete.useMutation()

    const router = useRouter()

    const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        deleteChannel({ channelId: props.channelId }).then(() => {
            toast.success('Se ha eliminado el canal')
            router.push('../')
        }).catch((e) => {
            const error = asTRPCError(e)!
            toast.error(error.message)
        })
    }
    return <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-[160px]">Eliminar canal</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro que querés eliminar el canal?</AlertDialogTitle>
                <AlertDialogDescription>
                    Eliminar canal permanentemente.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600 active:bg-red-700"
                    onClick={handleDelete}
                    disabled={isLoading}
                >Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}