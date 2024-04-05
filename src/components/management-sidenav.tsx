import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";
import {
  ArrowRightLeftIcon,
  BadgeDollarSignIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MessageSquareReplyIcon,
} from "lucide-react";

export default function ManagementSidenav() {
  return (
    <Sidenav>
      <SidenavSeparator>General</SidenavSeparator>
      <SidenavItem icon={<LayoutDashboardIcon />} href="/dashboard">
        Inicio
      </SidenavItem>
      <SidenavSeparator>Gestión Bitcompay</SidenavSeparator>
      <SidenavItem
        icon={<BadgeDollarSignIcon />}
        href="/dashboard/management/transactions"
      >
        Transacciones
      </SidenavItem>
      <SidenavItem
        icon={<FileTextIcon />}
        href="/dashboard/management/documents"
      >
        Documentos subidos
      </SidenavItem>
      <SidenavItem
        icon={<ArrowRightLeftIcon />}
        href="/dashboard/management/generate"
      >
        Archivos de salida
      </SidenavItem>
      <SidenavItem
        icon={<MessageSquareReplyIcon />}
        href="/dashboard/management/response"
      >
        Respuesta
      </SidenavItem>
    </Sidenav>
  );
}
