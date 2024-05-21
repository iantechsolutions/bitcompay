import { cookies } from 'next/headers'

import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Toaster } from '~/components/ui/sonner'
import { TRPCReactProvider } from '~/trpc/react'
dayjs.locale('es')

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <TRPCReactProvider cookies={cookies().toString()}>
            {props.children}
            <Toaster />
        </TRPCReactProvider>
    )
}
