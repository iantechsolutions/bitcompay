'use client'
import { PlusCircle } from 'lucide-react'
import StatusForm from '~/components/status-form'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
export default function AddStatusDialog() {
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
                    <StatusForm />
                </DialogContent>
            </Dialog>
        </>
    )
}
