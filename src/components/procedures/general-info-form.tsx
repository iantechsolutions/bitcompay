import dayjs from 'dayjs'
import { useState } from 'react'
import 'dayjs/locale/es'
import utc from 'dayjs/plugin/utc'
import { Calendar as CalendarIcon } from 'lucide-react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { cn } from '~/lib/utils'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
dayjs.extend(utc)
dayjs.locale('es')
type Inputs = {
    bussinessUnit: string
    plan: string
    birth_date: string
    mode: string
    name: string
    billing_number: string
}

export default function GeneralInfoForm() {
    const form = useForm<Inputs>()
    const [mode, setMode] = useState('')
    const onSubmit: SubmitHandler<Inputs> = async (_data) => {}

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <FormField
                    control={form.control}
                    name='bussinessUnit'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unidad de negocio</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Seleccione una unidad de negocio' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>{/*/ aca van las unidaddes de negocio opciones con SelectItem //attr value*/}</SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='plan'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Plan</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Seleccione un Plan' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>{/*/ aca van los planes opciones con SelectItem // attr value*/}</SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='birth_date'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor='birth_date'>Fecha de vigencia</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild={true}>
                                    <FormControl>
                                        <Button
                                            variant={'outline'}
                                            className={cn('w-[240px] pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                        >
                                            <p>
                                                {field.value ? (
                                                    dayjs.utc(field.value).format('D [de] MMMM [de] YYYY')
                                                ) : (
                                                    <span>Escoga una fecha</span>
                                                )}
                                            </p>
                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                        mode='single'
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={field.onChange}
                                        disabled={(date: Date) => date < new Date('1900-01-01')}
                                        initialFocus={true}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='mode'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Modo</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value)
                                    setMode(value)
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Seleccione un modo' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value='Admin'>Administrador</SelectItem>
                                    <SelectItem value='Member'>Integrante</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                {mode === 'Admin' && (
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <Input {...field} />
                            </FormItem>
                        )}
                    />
                )}

                {mode === 'Member' && (
                    <FormField
                        control={form.control}
                        name='billing_number'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nro de Facturación</FormLabel>
                                <Input {...field} />
                            </FormItem>
                        )}
                    />
                )}
            </form>
        </Form>
    )
}
