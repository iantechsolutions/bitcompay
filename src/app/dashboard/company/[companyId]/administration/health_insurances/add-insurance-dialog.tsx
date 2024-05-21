'use client'
import { PlusCircle } from 'lucide-react'
import InsurancesForm from '~/components/insurances-form'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
export default function AddInsuranceDialog() {
    return (
        <>
            <Dialog>
                <DialogTrigger asChild={true}>
                    <Button className='btn btn-primary'>
                        <PlusCircle /> Agregar Obra social
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Obra social de negocio</DialogTitle>
                    </DialogHeader>
                    <InsurancesForm />
                </DialogContent>
            </Dialog>
        </>
    )
}
