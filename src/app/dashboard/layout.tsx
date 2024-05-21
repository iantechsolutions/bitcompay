import { cookies } from 'next/headers'

import dayjs from 'dayjs'
import { Toaster } from '~/components/ui/sonner'
import { TRPCReactProvider } from '~/trpc/react'
import 'dayjs/locale/es'
dayjs.locale('es')

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <TRPCReactProvider cookies={cookies().toString()}>
            {props.children}
            <Toaster />
        </TRPCReactProvider>
    )
}
