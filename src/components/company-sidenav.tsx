import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";
import {
  ActivitySquareIcon,
  FileUpIcon,
  LayoutDashboardIcon,
  MessageCircleQuestionIcon,
  BadgeDollarSign,
  Contact,
  Users,
} from "lucide-react";

export default function CompanySidenav(props: { companyId: string }) {
  return (
    <Sidenav>
      <SidenavSeparator>General</SidenavSeparator>
      <SidenavItem icon={<LayoutDashboardIcon />} href="/dashboard">
        Inicio
      </SidenavItem>
      <SidenavSeparator>Gestión de documentos</SidenavSeparator>
      <SidenavItem
        icon={<FileUpIcon />}
        href={`/dashboard/company/${props.companyId}/uploads`}
      >
        Subida
      </SidenavItem>
      <SidenavItem
        icon={<ActivitySquareIcon />}
        href={`/dashboard/company/${props.companyId}/monitoring`}
      >
        Monitoreo
      </SidenavItem>
      <SidenavItem
        icon={<MessageCircleQuestionIcon />}
        href={`/dashboard/company/${props.companyId}/support`}
      >
        Soporte
      </SidenavItem>
      <SidenavSeparator>Seccion 2</SidenavSeparator>
      <SidenavItem
        icon={<BadgeDollarSign />}
        href={`/dashboard/company/${props.companyId}/sellers`}
      >
        Vendedores
      </SidenavItem>
      <SidenavItem
        icon={<Contact />}
        href={`/dashboard/company/${props.companyId}/providers`}
      >
        Proveedores
      </SidenavItem>
      <SidenavItem
        icon={<Users />}
        href={`/dashboard/company/${props.companyId}/clients`}
      >
        Clientes
      </SidenavItem>
    </Sidenav>
  );
}
