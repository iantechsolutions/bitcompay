'use client'
import { PlusCircle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import UnitsForm from '~/components/units-form'
import { useCompanyData } from '../../company-provider'

export default function AddUnitDialog() {
    const company = useCompanyData()
    const companyId = company?.id
    return (
        <>
            <Dialog>
                <DialogTrigger asChild={true}>
                    <Button className='btn btn-primary'>
                        <PlusCircle /> Agregar unidad
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar unidad de negocio</DialogTitle>
                    </DialogHeader>
                    <UnitsForm companyId={companyId} />
                </DialogContent>
            </Dialog>
        </>
    )
}
