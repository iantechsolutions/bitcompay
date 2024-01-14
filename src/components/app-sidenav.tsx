import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav"
import { ActivityIcon, ActivitySquareIcon, BanknoteIcon, DollarSignIcon, FileUpIcon, FingerprintIcon, LayoutDashboardIcon, MessageCircleQuestionIcon, MessageSquareReplyIcon, Settings2Icon, UsersIcon } from 'lucide-react';

export default function AppSidenav() {
    return <Sidenav>
        <SidenavSeparator>Global</SidenavSeparator>
        <SidenavItem icon={<LayoutDashboardIcon />} href="/dashboard">Dashboard</SidenavItem>
        <SidenavSeparator>Administración</SidenavSeparator>
        <SidenavItem icon={<Settings2Icon />} href="/dashboard/admin/global">Global</SidenavItem>
        <SidenavItem icon={<UsersIcon />} href="/dashboard/admin/users">Usuarios</SidenavItem>
        <SidenavItem icon={<FingerprintIcon />} href="/dashboard/admin/roles">Roles</SidenavItem>
        <SidenavItem icon={<DollarSignIcon />} href="/dashboard/admin/costs">Costos</SidenavItem>
        <SidenavItem icon={<BanknoteIcon />} href="/dashboard/admin/cc">Cuenta corriente</SidenavItem>
        <SidenavItem icon={<ActivityIcon />} href="/dashboard/admin/monitoring">Monitoreo dinámico</SidenavItem>
        <SidenavSeparator>Gestión documental</SidenavSeparator>
        <SidenavItem icon={<FileUpIcon />} href="/dashboard/documents/uploads">Subida</SidenavItem>
        <SidenavItem icon={<MessageSquareReplyIcon />} href="/dashboard/documents/response">Respuesta</SidenavItem>
        <SidenavItem icon={<ActivitySquareIcon />} href="/dashboard/documents/monitoring">Monitoreo</SidenavItem>
        <SidenavItem icon={<MessageCircleQuestionIcon />} href="/dashboard/documents/support">Soporte</SidenavItem>
    </Sidenav>
}