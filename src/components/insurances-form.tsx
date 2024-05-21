import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '~/trpc/react'
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
;('')
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { asTRPCError } from '~/lib/errors'
import type { RouterOutputs } from '~/trpc/shared'
type Inputs = {
    name: string
}

export default function InsurancesForm({
    insurance,
    setOpen,
}: {
    insurance?: RouterOutputs['healthInsurances']['get']
    setOpen?: (open: boolean) => void
}) {
    const router = useRouter()
    const UnitSchema = z.object({
        name: z.string().min(1, { message: 'El nombre es requerido' }),
    })
    const form = useForm<Inputs>({
        resolver: zodResolver(UnitSchema),
        defaultValues: { name: insurance ? insurance.name! : '' },
    })
    const { mutateAsync: createInsurance } = api.healthInsurances.create.useMutation()
    const { mutateAsync: updateInsurance } = api.healthInsurances.change.useMutation()
    const OnSubmit: SubmitHandler<Inputs> = async (data) => {
        const parsedData = UnitSchema.parse(data)

        await createInsurance({ ...parsedData })

        if (setOpen) {
            setOpen(false)
        }
    }
    const onChange: SubmitHandler<Inputs> = async (data) => {
        try {
            const parsedData = UnitSchema.parse(data)
            await updateInsurance({
                ...parsedData,
                healthInsuranceId: insurance!.id!,
            })
            router.refresh()
        } catch (e) {
            const error = asTRPCError(e)!
            toast.error(error.message)
        }
    }
    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(insurance ? onChange : OnSubmit)}
                    className='flex-col items-center justify-center gap-2 space-y-8'
                >
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor='name'>Nombre</FormLabel>
                                <FormControl>
                                    <Input type='text' id='name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type='submit'>{insurance ? 'Guardar cambios' : 'Crear unidad de negocio'}</Button>
                </form>
            </Form>
        </>
    )
}
