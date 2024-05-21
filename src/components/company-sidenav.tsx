'use client'
import {
    ActivitySquareIcon,
    BadgeDollarSign,
    Blend,
    Boxes,
    Contact,
    FileUpIcon,
    Gem,
    HeartPulse,
    LayoutDashboardIcon,
    LayoutPanelLeft,
    NotebookPen,
    Option,
    Users,
} from 'lucide-react'
import { Notebook } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Sidenav, { SidenavItem, SidenavSeparator } from './sidenav'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'

export default function CompanySidenav(props: { companyId: string }) {
    const menu: Record<string, string> = {
        Administracion: 'administration/',
        'Gestión de documentos': 'gestion/',
        General: 'general/',
        Clientes: 'clients/',
        Proveedores: 'providers/',
        Ventas: 'sales/',
    }
    const pathname = usePathname()
    const isActive = (href: keyof typeof menu) => {
        if (href !== undefined) {
            if (href in menu) {
                const menuValue = menu[href]
                if (menuValue !== undefined) {
                    return pathname.includes(menuValue)
                }
            }
        }
    }
    return (
        <Sidenav className='h-full bg-[#e9fcf8]'>
            <img
                className='bg-[#e9fcf8] pt-8 pr-5 pb-5 pl-5'
                src='https://utfs.io/f/2241aac5-d6d9-4310-bc31-db91cf5565cb-j8i4q3.png'
                alt='logo'
            />
            <Accordion type='single' className='pt-5 pr-5 pl-5' collapsible={true}>
                <AccordionItem value='item-1' className='border-none'>
                    <AccordionTrigger
                        className={
                            isActive('General')
                                ? 'rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline'
                                : 'rounded-lg px-1 py-1.5 hover:no-underline'
                        }
                    >
                        <SidenavSeparator>General </SidenavSeparator>
                    </AccordionTrigger>
                    <AccordionContent>
                        <SidenavItem icon={<LayoutDashboardIcon />} href={`/dashboard/company/${props.companyId}/general/dashboard`}>
                            Dashboard
                        </SidenavItem>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='item-3' className='border-none'>
                    <AccordionTrigger
                        className={
                            isActive('Administracion')
                                ? 'rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline'
                                : 'rounded-lg px-1 py-1.5 hover:no-underline'
                        }
                    >
                        <SidenavSeparator>Administracion</SidenavSeparator>
                    </AccordionTrigger>
                    <AccordionContent>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/administration/start`} icon={<LayoutPanelLeft />}>
                            Inicio
                        </SidenavItem>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/administration/providers`} icon={<Users />}>
                            Proveedores
                        </SidenavItem>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/administration/plans`} icon={<Notebook />}>
                            Planes
                        </SidenavItem>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/administration/modos`} icon={<Blend />}>
                            Modos
                        </SidenavItem>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/administration/bussiness_units`} icon={<Boxes />}>
                            Unidades de negocio
                        </SidenavItem>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/administration/health_insurances`} icon={<HeartPulse />}>
                            Obras sociales
                        </SidenavItem>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/administration/differentials`} icon={<Option />}>
                            Diferenciales
                        </SidenavItem>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/administration/bonuses`} icon={<Gem />}>
                            Bonificaciones
                        </SidenavItem>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/administration/client_statuses`} icon={<NotebookPen />}>
                            Estados
                        </SidenavItem>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value='item-2' className='border-none'>
                    <AccordionTrigger
                        className={
                            isActive('Gestión de documentos')
                                ? 'rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline'
                                : 'rounded-lg px-1 py-1.5 hover:no-underline'
                        }
                    >
                        <SidenavSeparator>Gestión de documentos</SidenavSeparator>
                    </AccordionTrigger>
                    <AccordionContent>
                        <SidenavItem icon={<FileUpIcon />} href={`/dashboard/company/${props.companyId}/gestion/uploads`}>
                            Subida
                        </SidenavItem>
                        <SidenavItem icon={<ActivitySquareIcon />} href={`/dashboard/company/${props.companyId}/gestion/monitoring`}>
                            Monitoreo
                        </SidenavItem>
                        <SidenavItem icon={<Users />} href={`/dashboard/company/${props.companyId}/gestion/support`}>
                            Soporte
                        </SidenavItem>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-4' className='border-none'>
                    <AccordionTrigger
                        className={
                            isActive('Ventas')
                                ? 'rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline'
                                : 'rounded-lg px-1 py-1.5 hover:no-underline'
                        }
                    >
                        <SidenavSeparator>Ventas</SidenavSeparator>
                    </AccordionTrigger>
                    <AccordionContent>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/sales/start`} icon={<BadgeDollarSign />}>
                            Inicio
                        </SidenavItem>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/sales/procedures`} icon={<Users />}>
                            Tramites
                        </SidenavItem>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-5' className='border-none'>
                    <AccordionTrigger
                        className={
                            isActive('Clientes')
                                ? 'rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline'
                                : 'rounded-lg px-1 py-1.5 hover:no-underline'
                        }
                    >
                        <SidenavSeparator>Clientes</SidenavSeparator>
                    </AccordionTrigger>
                    <AccordionContent>
                        <SidenavItem href={`/dashboard/company/${props.companyId}/clients/clients`} icon={<Users />}>
                            Inicio
                        </SidenavItem>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value='item-6' className='border-none'>
                    <AccordionTrigger
                        className={
                            isActive('Proveedores')
                                ? 'rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline'
                                : 'rounded-lg px-1 py-1.5 hover:no-underline'
                        }
                    >
                        <SidenavSeparator>Proveedores</SidenavSeparator>
                    </AccordionTrigger>
                    <AccordionContent>
                        <SidenavItem icon={<Contact />} href={`/dashboard/company/${props.companyId}/providers`}>
                            Inicio
                        </SidenavItem>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Sidenav>
    )
}
