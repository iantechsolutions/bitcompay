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
    description: string
}

export default function UnitsForm({
    unit,
    setOpen,
    companyId,
}: {
    unit?: RouterOutputs['bussinessUnits']['get']
    setOpen?: (open: boolean) => void
    companyId?: string
}) {
  const router = useRouter();
  const UnitSchema = z.object({
    description: z.string().min(1, { message: "La descripción es requerida" }),
    brandId: z.string(),
  });
  const form = useForm<Inputs>({
    resolver: zodResolver(UnitSchema),
    defaultValues: { description: unit ? unit.description! : "" },
  });
  const { mutateAsync: createUnit } = api.bussinessUnits.create.useMutation();
  const { mutateAsync: updateUnit } = api.bussinessUnits.change.useMutation();
  const OnSubmit: SubmitHandler<Inputs> = async (data) => {
    const parsedData = UnitSchema.parse(data);
    if (companyId) {
      await createUnit({ ...parsedData, companyId: companyId });
    }
    if (setOpen) {
      setOpen(false);
    }
    const onChange: SubmitHandler<Inputs> = async (data) => {
        try {
            const parsedData = UnitSchema.parse(data)
            await updateUnit({ ...parsedData, bussinessUnitId: unit!.id! })
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
                    onSubmit={form.handleSubmit(unit ? onChange : OnSubmit)}
                    className='flex-col items-center justify-center gap-2 space-y-8'
                >
                    <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor='description'>Descripción</FormLabel>
                                <FormControl>
                                    <Input type='text' id='description' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type='submit'>{unit ? unit.description : 'Crear unidad de negocio'}</Button>
                </form>
            </Form>
        </>
    )
    }
}