'use client'

import { CheckIcon, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type MouseEventHandler, useState } from 'react'
import { toast } from 'sonner'
import LayoutContainer from '~/components/layout-container'
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
import { asTRPCError } from '~/lib/errors'
import { api } from '~/trpc/react'
import type { RouterOutputs } from '~/trpc/shared'

export default function StatusPage({
    status,
}: {
    status: NonNullable<RouterOutputs['status']['get']>
}) {
    const { mutateAsync: change, isLoading } = api.status.change.useMutation()
    const [description, setDescription] = useState<string>(status.description!)
    const [code, setCode] = useState<string>(status.code!)
    const router = useRouter()
    async function handleChange() {
        try {
            await change({
                statusId: status.id,
                code,
                description,
            })
            toast.success('Se han guardado los cambios')
            router.refresh()
        } catch (e) {
            const error = asTRPCError(e)!
            toast.error(error.message)
        }
    }

    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex justify-between'>
                    <Title>{status.description}</Title>
                    <Button disabled={isLoading} onClick={handleChange}>
                        {isLoading ? <Loader2 className='mr-2 animate-spin' /> : <CheckIcon className='mr-2' />}
                        Aplicar
                    </Button>
                </div>
                <Accordion type='single' collapsible={true} className='w-full'>
                    <AccordionItem value='item-1'>
                        <AccordionTrigger>
                            <h2 className='text-md'>Info. del estado</h2>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Card className='p-5'>
                                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                                    <div className='col-span-2'>
                                        <div className='col-span-2'>
                                            <Label htmlFor='code'>Codigo</Label>
                                            <Input id='code' value={code} onChange={(e) => setCode(e.target.value)} />
                                        </div>
                                        <Label htmlFor='description'>Descripción</Label>
                                        <Input id='description' value={description} onChange={(e) => setDescription(e.target.value)} />
                                    </div>
                                </div>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value='item-2' className='border-none'>
                        <AccordionTrigger>
                            <h2 className='text-md'>Eliminar Estado de transaccion</h2>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className='flex justify-end'>
                                <DeleteStatus statusId={status.id} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </LayoutContainer>
    )
}

function DeleteStatus(props: { statusId: string }) {
    const { mutateAsync: DeleteStatus, isLoading } = api.status.delete.useMutation()

    const router = useRouter()

    const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault()
        DeleteStatus({ statusId: props.statusId })
            .then(() => {
                toast.success('Se ha eliminado el estado')
                router.push('../statuses')
                router.refresh()
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
                    Eliminar estado
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro que querés eliminar el estado?</AlertDialogTitle>
                    <AlertDialogDescription>Eliminar estado permanentemente.</AlertDialogDescription>
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
