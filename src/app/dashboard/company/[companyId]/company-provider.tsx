"use client"

import { createContext, useContext } from "react";
import { Title } from "~/components/title";
import { RouterOutputs } from "~/trpc/shared";

const companyContext = createContext<RouterOutputs['companies']['get'] | null>(null)

export function CompanyProvider(props: { children: React.ReactNode, company: RouterOutputs['companies']['get'] | null }) {
    if (!props.company) {
        return <>
            <Title>No se puede acceder a esta empresa</Title>
        </>
    }

    return <companyContext.Provider value={props.company}>
        {props.children}
    </companyContext.Provider>
}

export function useCompanyData() {
    const d = useContext(companyContext)

    if (!d) {
        throw new Error('useCompanyData must be used inside a CompanyProvider')
    }

    return d
}