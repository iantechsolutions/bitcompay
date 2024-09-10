'use client'
import type React from 'react'
import { createContext, useContext, useState } from 'react'

type UpdateProductsBatchFunction = (updatedArray: Record<string, unknown>[]) => void

interface ReceiveDataContextType {
    productsBatchArray: Record<string, unknown>[] | null
    updateProductsBatch: UpdateProductsBatchFunction
}

const ReceiveDataContext = createContext<ReceiveDataContextType | null>(null)

export function ReceiveDataProvider(props: { children: React.ReactNode }) {
    const [productsBatchArray, setProductsBatchArray] = useState<Record<string, unknown>[] | null>(null)

    const updateProductsBatch: UpdateProductsBatchFunction = (updatedArray) => {
        setProductsBatchArray(updatedArray)
    }

    const contextValue: ReceiveDataContextType = {
        productsBatchArray,
        updateProductsBatch,
    }

    return <ReceiveDataContext.Provider value={contextValue}>{props.children}</ReceiveDataContext.Provider>
}

export function useReceiveData() {
    const context = useContext(ReceiveDataContext)
    if (context === null) {
        throw new Error('useReceiveData must be used within Received data provider')
    }
    return context
}
