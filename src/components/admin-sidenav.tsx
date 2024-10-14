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
} from "lucide-react";
import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";

export default function AdminSidenav() {
  return (
    <Sidenav>
      <SidenavSeparator>Global</SidenavSeparator>
      <SidenavItem icon={<LayoutDashboardIcon />} href="/dashboard">
        Inicio
      </SidenavItem>
      <SidenavSeparator>Administración</SidenavSeparator>
      <SidenavItem icon={<PackageIcon />} href="/admin/products">
        Productos
      </SidenavItem>
      <SidenavItem icon={<FileLineChart />} href="/admin/channels">
        Canales
      </SidenavItem>
      <SidenavItem icon={<Building2Icon />} href="/admin/companies">
        Empresas
      </SidenavItem>
      <SidenavItem icon={<Stamp />} href="/admin/brands">
        Marcas
      </SidenavItem>
      <SidenavItem icon={<Landmark />} href="/admin/statuses">
        Estados
      </SidenavItem>
      <SidenavItem icon={<Banknote />} href="/admin/factura">
        Facturación
      </SidenavItem>
      <SidenavItem icon={<UsersIcon />} href="/admin/users">
        Usuarios
      </SidenavItem>
      <SidenavItem icon={<FingerprintIcon />} href="/admin/roles">
        Roles
      </SidenavItem>
      <SidenavItem icon={<DollarSignIcon />} href="/admin/costs">
        Costos
      </SidenavItem>
      <SidenavItem icon={<BanknoteIcon />} href="/admin/cc">
        Cuenta corriente
      </SidenavItem>
      <SidenavItem icon={<ActivityIcon />} href="/admin/monitoring">
        Monitoreo dinámico
      </SidenavItem>
    </Sidenav>
  );
}
