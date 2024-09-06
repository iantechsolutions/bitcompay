import {
  ArrowRightLeftIcon,
  BadgeDollarSignIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MessageSquareReplyIcon,
} from "lucide-react";
import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";

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
        href="/management/transactions"
      >
        Transacciones
      </SidenavItem>
      <SidenavItem icon={<FileTextIcon />} href="/management/documents">
        Documentos subidos
      </SidenavItem>
      <SidenavItem icon={<ArrowRightLeftIcon />} href="/management/generate">
        Archivos de salida
      </SidenavItem>
      <SidenavItem
        icon={<MessageSquareReplyIcon />}
        href="/management/response"
      >
        Respuesta
      </SidenavItem>
    </Sidenav>
  );
}
