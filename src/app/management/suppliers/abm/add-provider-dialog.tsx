'use client'
import { PlusCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '~/components/ui/button'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'

import ProviderForm from '~/components/provider-form'

export function AddProviderDialog() {
    const [open, setOpen] = useState(false)
    const _router = useRouter()
    return (
        <>
            <Button onClick={() => setOpen(true)}
            className="rounded-full gap-1 px-4 py-5 text-base text-[#3E3E3E] bg-[#BEF0BB] hover:bg-[#DEF5DD]">
                  <PlusCircleIcon className="h-5 mr-1 stroke-1" />
                Crear Proveedor
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='max-h-screen overflow-y-scroll px-9 py-8'>
                    <DialogHeader className='mb-3'>
                        <DialogTitle>Agregar nuevo proveedor</DialogTitle>
                    </DialogHeader>
                    <ProviderForm setOpen={setOpen} />
                </DialogContent>
            </Dialog>
        </>
    )
}
