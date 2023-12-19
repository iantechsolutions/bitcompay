import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav"
import { ActivityIcon, ActivitySquareIcon, BanknoteIcon, DollarSignIcon, FileUpIcon, LayoutDashboardIcon, MessageCircleQuestionIcon, MessageSquareReplyIcon, Settings2Icon, UsersIcon } from 'lucide-react';

export default function AdminSidenav() {
    return <Sidenav>
        <SidenavSeparator>Global</SidenavSeparator>
        <SidenavItem icon={<LayoutDashboardIcon />} href="/dashboard">Dashboard</SidenavItem>
        <SidenavItem icon={<Settings2Icon />} href="/dashboard">Configuraciones</SidenavItem>
        <SidenavSeparator>Administración</SidenavSeparator>
        <SidenavItem icon={<Settings2Icon />}>Global</SidenavItem>
        <SidenavItem icon={<UsersIcon />}>Usuarios</SidenavItem>
        <SidenavItem icon={<DollarSignIcon />}>Costos</SidenavItem>
        <SidenavItem icon={<BanknoteIcon />}>Cuenta corriente</SidenavItem>
        <SidenavItem icon={<ActivityIcon />}>Monitoreo dinámico</SidenavItem>
        <SidenavSeparator>Gestión documental</SidenavSeparator>
        <SidenavItem icon={<FileUpIcon />}>Recepción</SidenavItem>
        <SidenavItem icon={<MessageSquareReplyIcon />}>Respuesta</SidenavItem>
        <SidenavItem icon={<ActivitySquareIcon />}>Monitoreo</SidenavItem>
        <SidenavItem icon={<MessageCircleQuestionIcon />}>Soporte</SidenavItem>
    </Sidenav>
}