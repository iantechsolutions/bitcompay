'use client'

import { useRouter } from 'next/navigation'

import { Button } from '~/components/ui/button'

import { asTRPCError } from '~/lib/errors'
import { api } from '~/trpc/react'

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
    AlertDialogTitle,
    AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { AlertDialogFooter, AlertDialogHeader } from '~/components/ui/alert-dialog'
import { Card } from '~/components/ui/card'
import UnitsForm from '~/components/units-form'
import type { RouterOutputs } from '~/trpc/shared'
import { useCompanyData } from '../../../company-provider'

export default function BussinessPage(props: {
    unit: RouterOutputs['bussinessUnits']['get']
}) {
    return (
        <LayoutContainer>
            <section className='space-y-2'>
                <div className='flex-col justify-between'>
                    <Title>{props.unit!.description}</Title>
                    <Accordion type='single' collapsible={true}>
                        <AccordionItem value='item-1'>
                            <AccordionTrigger>Editar Plan</AccordionTrigger>
                            <AccordionContent>
                                <UnitsForm unit={props.unit} />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value='item-2'>
                            <AccordionTrigger>Eliminar Plan</AccordionTrigger>
                            <AccordionContent>
                                <Card className='p-5'>
                                    <div className='flex justify-end'>
                                        <DeleteUnit unitId={props.unit!.id} />
                                    </div>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>
        </LayoutContainer>
    )
}

export function DeleteUnit(props: { unitId: string }) {
    const company = useCompanyData()
    const { mutateAsync: deleteUnit, isLoading } = api.bussinessUnits.delete.useMutation()
    const router = useRouter()
    const handleDelete = async () => {
        try {
            await deleteUnit({ bussinessUnitId: props.unitId })
            toast.success('unidad eliminado')
            router.push(`/dashboard/company/${company.id}/administration/bussiness_units`)
            router.refresh()
        } catch (e) {
            const error = asTRPCError(e)!
            toast.error(error.message)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild={true}>
                <Button variant='destructive' className='w-[160px]'>
                    Eliminar Unidad
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro que querés eliminar esta unidad?</AlertDialogTitle>
                    <AlertDialogDescription>Eliminar Unidad permanentemente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
