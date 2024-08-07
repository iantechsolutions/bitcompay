import {
    ActivityIcon,
    Banknote,
    BanknoteIcon,
    Building2Icon,
    DollarSignIcon,
    FileLineChart,
    FingerprintIcon,
    Landmark,
    LayoutDashboardIcon,
    PackageIcon,
    Stamp,
    UsersIcon,
} from 'lucide-react'
import Sidenav, { SidenavItem, SidenavSeparator } from './sidenav'

export default function AdminSidenav() {
    return (
        <Sidenav>
            <SidenavSeparator>Global</SidenavSeparator>
            <SidenavItem icon={<LayoutDashboardIcon />} href='/dashboard'>
                Inicio
            </SidenavItem>
            <SidenavSeparator>Administración</SidenavSeparator>
            <SidenavItem icon={<PackageIcon />} href='/dashboard/admin/products'>
                Productos
            </SidenavItem>
            <SidenavItem icon={<FileLineChart />} href='/dashboard/admin/channels'>
                Canales
            </SidenavItem>
            <SidenavItem icon={<Building2Icon />} href='/dashboard/admin/companies'>
                Empresas
            </SidenavItem>
            <SidenavItem icon={<Stamp />} href='/dashboard/admin/brands'>
                Marcas
            </SidenavItem>
            <SidenavItem icon={<Landmark />} href='/dashboard/admin/statuses'>
                Estados
            </SidenavItem>
            <SidenavItem icon={<Banknote />} href='/dashboard/admin/factura'>
                Facturacion
            </SidenavItem>
            <SidenavItem icon={<UsersIcon />} href='/dashboard/admin/users'>
                Usuarios
            </SidenavItem>
            <SidenavItem icon={<FingerprintIcon />} href='/dashboard/admin/roles'>
                Roles
            </SidenavItem>
            <SidenavItem icon={<DollarSignIcon />} href='/dashboard/admin/costs'>
                Costos
            </SidenavItem>
            <SidenavItem icon={<BanknoteIcon />} href='/dashboard/admin/cc'>
                Cuenta corriente
            </SidenavItem>
            <SidenavItem icon={<ActivityIcon />} href='/dashboard/admin/monitoring'>
                Monitoreo dinámico
            </SidenavItem>
        </Sidenav>
    )
}
