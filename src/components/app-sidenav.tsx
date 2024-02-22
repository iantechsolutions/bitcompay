import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav"
import { ActivityIcon, ActivitySquareIcon, ArrowRightLeftIcon, BadgeDollarSignIcon, BanknoteIcon, Building2Icon, DollarSignIcon, FileLineChart, FileTextIcon, FileUpIcon, FingerprintIcon, LayoutDashboardIcon, MessageCircleQuestionIcon, MessageSquareReplyIcon, Settings2Icon, ShoppingBagIcon, TextIcon, UsersIcon } from 'lucide-react';

export default function AppSidenav() {
    return <Sidenav>
        <SidenavSeparator>Global</SidenavSeparator>
        <SidenavItem icon={<LayoutDashboardIcon />} href="/dashboard">Dashboard</SidenavItem>
        <SidenavSeparator>Administración</SidenavSeparator>
        <SidenavItem icon={<Building2Icon />} href="/dashboard/admin/global">Empresas</SidenavItem>
        <SidenavItem icon={<FileLineChart />} href="/dashboard/admin/global">Canales</SidenavItem>
        <SidenavItem icon={<ShoppingBagIcon />} href="/dashboard/admin/products">Productos</SidenavItem>
        <SidenavItem icon={<UsersIcon />} href="/dashboard/admin/users">Usuarios</SidenavItem>
        <SidenavItem icon={<FingerprintIcon />} href="/dashboard/admin/roles">Roles</SidenavItem>
        <SidenavItem icon={<DollarSignIcon />} href="/dashboard/admin/costs">Costos</SidenavItem>
        <SidenavItem icon={<BanknoteIcon />} href="/dashboard/admin/cc">Cuenta corriente</SidenavItem>
        <SidenavItem icon={<ActivityIcon />} href="/dashboard/admin/monitoring">Monitoreo dinámico</SidenavItem>
        <SidenavSeparator>Gestión Bitcompay</SidenavSeparator>
        <SidenavItem icon={<BadgeDollarSignIcon />} href="/dashboard/management/transactions">Transacciones</SidenavItem>
        <SidenavItem icon={<FileTextIcon />} href="/dashboard/management/documents">Documentos subidos</SidenavItem>
        <SidenavItem icon={<ArrowRightLeftIcon />} href="/dashboard/management/generate">Archivos de entrada</SidenavItem>
        <SidenavItem icon={<MessageSquareReplyIcon />} href="/dashboard/management/response">Respuesta</SidenavItem>
        <SidenavSeparator>Gestión documental</SidenavSeparator>
        <SidenavItem icon={<FileUpIcon />} href="/dashboard/company/uploads">Subida</SidenavItem>
        <SidenavItem icon={<ActivitySquareIcon />} href="/dashboard/company/monitoring">Monitoreo</SidenavItem>
        <SidenavItem icon={<MessageCircleQuestionIcon />} href="/dashboard/company/support">Soporte</SidenavItem>
    </Sidenav>
}