import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";
import {
  ActivityIcon,
  BanknoteIcon,
  Building2Icon,
  DollarSignIcon,
  FileLineChart,
  FingerprintIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingBagIcon,
  UsersIcon,
  Stamp,
} from "lucide-react";

export default function AdminSidenav() {
  return (
    <Sidenav>
      <SidenavSeparator>Global</SidenavSeparator>
      <SidenavItem icon={<LayoutDashboardIcon />} href="/dashboard">
        Inicio
      </SidenavItem>
      <SidenavSeparator>Administración</SidenavSeparator>
      <SidenavItem icon={<PackageIcon />} href="/dashboard/admin/products">
        Productos
      </SidenavItem>
      <SidenavItem icon={<FileLineChart />} href="/dashboard/admin/channels">
        Canales
      </SidenavItem>
      <SidenavItem icon={<Building2Icon />} href="/dashboard/admin/companies">
        Empresas
      </SidenavItem>
      <SidenavItem icon={<Stamp />} href="/dashboard/admin/brands">
        Marcas
      </SidenavItem>
      <SidenavItem icon={<UsersIcon />} href="/dashboard/admin/users">
        Usuarios
      </SidenavItem>
      <SidenavItem icon={<FingerprintIcon />} href="/dashboard/admin/roles">
        Roles
      </SidenavItem>
      <SidenavItem icon={<DollarSignIcon />} href="/dashboard/admin/costs">
        Costos
      </SidenavItem>
      <SidenavItem icon={<BanknoteIcon />} href="/dashboard/admin/cc">
        Cuenta corriente
      </SidenavItem>
      <SidenavItem icon={<ActivityIcon />} href="/dashboard/admin/monitoring">
        Monitoreo dinámico
      </SidenavItem>
    </Sidenav>
  );
}
