import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav"
import { ActivitySquareIcon, FileUpIcon, LayoutDashboardIcon, MessageCircleQuestionIcon, } from 'lucide-react';

export default function CompanySidenav() {
    return <Sidenav>
        <SidenavSeparator>General</SidenavSeparator>
        <SidenavItem icon={<LayoutDashboardIcon />} href="/dashboard">Inicio</SidenavItem>
        <SidenavSeparator>Gestión de documentos</SidenavSeparator>
        <SidenavItem icon={<FileUpIcon />} href="/dashboard/company/uploads">Subida</SidenavItem>
        <SidenavItem icon={<ActivitySquareIcon />} href="/dashboard/company/monitoring">Monitoreo</SidenavItem>
        <SidenavItem icon={<MessageCircleQuestionIcon />} href="/dashboard/company/support">Soporte</SidenavItem>
    </Sidenav>
}