'use client'
import { CheckIcon, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type MouseEventHandler, useState } from 'react'
import { toast } from 'sonner'
import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
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
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { asTRPCError } from '~/lib/errors'
import { api } from '~/trpc/react'
import type { RouterOutputs } from '~/trpc/shared'

export default function ProductPage({
    product,
    channels,
}: {
    product: NonNullable<RouterOutputs['products']['get']>
    channels: RouterOutputs['channels']['list']
}) {
    const [productChannels, setProductChannels] = useState<Set<string>>(new Set(product.channels.map((c) => c.channelId)))

    const { mutateAsync: changeProduct, isLoading } = api.products.change.useMutation()

    const [name, setName] = useState(product.name)
    const [description, setDescription] = useState(product.description)

    async function handleChange() {
        try {
            await changeProduct({
                productId: product.id,
                channels: Array.from(productChannels),
                name,
                description,
            })
            toast.success('Se han guardado los cambios')
        } catch (e) {
            const error = asTRPCError(e)!
            toast.error(error.message)
        }
    }

    function changeProductChannel(channelId: string, enabled: boolean) {
        if (enabled) {
            productChannels.add(channelId)
        } else {
            productChannels.delete(channelId)
        }
        setProductChannels(new Set(productChannels))
    }

    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>{product.name}</Title>
                    <Button disabled={isLoading} onClick={handleChange}>
                        {isLoading ? <Loader2 className='mr-2 animate-spin' /> : <CheckIcon className='mr-2' />}
                        Aplicar
                    </Button>
                </div>
                <Accordion type='single' collapsible={true} className='w-full'>
                    <AccordionItem value='item-1'>
                        <AccordionTrigger>
                            <h2 className='text-md'>Canales habilitados</h2>
                        </AccordionTrigger>
                        <AccordionContent>
                            <List>
                                {channels.map((channel) => {
                                    return (
                                        <ListTile
                                            key={channel.id}
                                            leading={channel.number}
                                            title={channel.name}
                                            trailing={
                                                <Switch
                                                    checked={productChannels.has(channel.id)}
                                                    onCheckedChange={(checked) => changeProductChannel(channel.id, checked)}
                                                />
                                            }
                                        />
                                    )
                                })}
                            </List>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value='item-2'>
                        <AccordionTrigger>
                            <h2 className='text-md'>Info. de la producto</h2>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Card className='p-5'>
                                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                                    <div>
                                        <Label htmlFor='name'>Nombre</Label>
                                        <Input id='name' value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className='col-span-2'>
                                        <Label htmlFor='description'>Descripción</Label>
                                        <Input id='description' value={description} onChange={(e) => setDescription(e.target.value)} />
                                    </div>
                                </div>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value='item-4' className='border-none'>
                        <AccordionTrigger>
                            <h2 className='text-md'>Eliminar producto</h2>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className='flex justify-end'>
                                <DeleteProduct productId={product.id} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </LayoutContainer>
    )
}

function DeleteProduct(props: { productId: string }) {
    const { mutateAsync: deleteProduct, isLoading } = api.products.delete.useMutation()

    const router = useRouter()

    const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        deleteProduct({ productId: props.productId })
            .then(() => {
                toast.success('Se ha eliminado el producto')
                router.push('../products')
            })
            .catch((e) => {
                const error = asTRPCError(e)!
                toast.error(error.message)
            })
    }
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild={true}>
                <Button variant='destructive' className='w-[160px]'>
                    Eliminar producto
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro que querés eliminar el producto?</AlertDialogTitle>
                    <AlertDialogDescription>Eliminar producto permanentemente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className='bg-red-500 active:bg-red-700 hover:bg-red-600'
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
