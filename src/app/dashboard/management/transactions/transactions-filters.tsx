'use client'

import { Settings2Icon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'

export function TransactionsFiltersDialog() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button className='bg-white' variant='outline' onClick={() => setOpen(true)}>
                <Settings2Icon className='mr-2' size={20} />
                Filtros
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>Filtrar transacciones</DialogTitle>
                        {/* <DialogDescription>
                    
                </DialogDescription> */}
                    </DialogHeader>
                    <DialogFooter>
                        <Button>Aplicar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
