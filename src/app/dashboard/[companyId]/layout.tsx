import { ArrowLeftIcon } from 'lucide-react'
import AppLayout from '~/components/applayout'
import CompanySidenav from '~/components/company-sidenav'
import Sidenav, { SidenavItem } from '~/components/sidenav'
import { api } from '~/trpc/server'
import { CompanyProvider } from './company-provider'

export default async function Layout(props: {
    children?: React.ReactNode
    params: { companyId: string }
}) {
    const company = await api.companies.get.query({
        companyId: props.params.companyId,
    })

    // TODO: chequear acceso a la empresa

    return (
        <AppLayout
            // title={
            //   <img
            //     className=" pb-5 pt-5"
            //     src="https://utfs.io/f/2241aac5-d6d9-4310-bc31-db91cf5565cb-j8i4q3.png"
            //     alt="logo"
            //   ></img>
            // }
            headerClass='bg-[#e9fcf8]'
            sidenavClass='top-0'
            sidenav={
                company ? (
                    <CompanySidenav companyId={company.id} />
                ) : (
                    <Sidenav>
                        <SidenavItem href='/dashboard' icon={<ArrowLeftIcon />}>
                            Volver
                        </SidenavItem>
                    </Sidenav>
                )
            }
        >
            <CompanyProvider company={company}>{props.children}</CompanyProvider>
        </AppLayout>
    )
}
