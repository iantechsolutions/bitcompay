import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav"
import { ActivitySquareIcon, FileUpIcon, LayoutDashboardIcon, MessageCircleQuestionIcon, } from 'lucide-react';

export default function CompanySidenav(props: { companyId: string }) {
    return <Sidenav>
        <SidenavSeparator>General</SidenavSeparator>
        <SidenavItem icon={<LayoutDashboardIcon />} href="/dashboard">Inicio</SidenavItem>
        <SidenavSeparator>Gestión de documentos</SidenavSeparator>
        <SidenavItem icon={<FileUpIcon />} href={`/dashboard/company/${props.companyId}/uploads`}>Subida</SidenavItem>
        <SidenavItem icon={<ActivitySquareIcon />} href={`/dashboard/company/${props.companyId}/monitoring`}>Monitoreo</SidenavItem>
        <SidenavItem icon={<MessageCircleQuestionIcon />} href={`/dashboard/company/${props.companyId}/support`}>Soporte</SidenavItem>
    </Sidenav>
}