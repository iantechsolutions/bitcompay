'use client'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import 'dayjs/locale/es'
import utc from 'dayjs/plugin/utc'
import type { RouterOutputs } from '~/trpc/shared'
import { useCompanyData } from '../../../company-provider'
dayjs.extend(utc)
dayjs.locale('es')

type Inputs = {
    description: string
}

export default function ModoPage(props: {
    modo: RouterOutputs['modos']['get']
}) {
    const _router = useRouter()
    const _company = useCompanyData()
    const _initialValues: Inputs = {
        description: props.modo!.description!,
    }
    return (
        <div>
            <h1>hola</h1>
        </div>
    )
}
