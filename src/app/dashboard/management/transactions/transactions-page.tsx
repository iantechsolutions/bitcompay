"use client"

import { useLayoutEffect, useState } from "react"
import { LargeTable } from "~/components/table"
import { recHeaders } from "~/server/uploads/validators"

export default function TransactionsPage(props: {
    transactions: Record<string, any>[]
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

    return <LargeTable
        height={height}
        headers={recHeaders}
        rows={props.transactions}
    />
}