'use client'

// import { TransactionsFiltersDialog } from "./transactions-filters";
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useLayoutEffect, useState } from 'react'
import { LargeTable } from '~/components/table'
import { recHeaders } from '~/server/uploads/validators'
import 'dayjs/locale/es' // import the locale
import type { RouterOutputs } from '~/trpc/shared'
dayjs.extend(utc)
dayjs.locale('es')
export default function TransactionsPage(props: {
    transactions: RouterOutputs['transactions']['list']
}) {
    const [height, setHeight] = useState(600)

    useLayoutEffect(() => {
        function handleResize() {
            setHeight(window.innerHeight - (70 + 24))
        }

        window.addEventListener('resize', handleResize)

        handleResize()

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const tableRows = props.transactions.map((transaction) => {
        return {
            ...transaction,
            period: dayjs.utc(transaction.period).format('MMMM YYYY').toUpperCase(),
        }
    })

    return (
        <div>
            <LargeTable height={height} headers={recHeaders} rows={tableRows} />
            <div className='fixed top-4 right-20 z-10'>{/* <TransactionsFiltersDialog filters={0} onChange={() => {}} /> */}</div>
        </div>
    )
}
