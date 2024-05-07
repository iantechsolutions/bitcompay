import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";
import {
  ActivitySquareIcon,
  FileUpIcon,
  LayoutDashboardIcon,
  BadgeDollarSign,
  Contact,
  Users,
  LayoutPanelLeft,
} from "lucide-react";
import { VscNotebook } from "react-icons/vsc";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "./ui/accordion";

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
        icon={<Users />}
        href={`/dashboard/company/${props.companyId}/support`}
      >
        Soporte
      </SidenavItem>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <SidenavSeparator>Administracion</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration`}
              icon={<LayoutPanelLeft />}
            >
              Inicio
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/providers`}
              icon={<Users />}
            >
              Proveedores
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/planes`}
              icon={<Users />}
            >
              Planes
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/units`}
              icon={<Users />}
            >
              Unidades de negocio
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/health-insurance`}
              icon={<Users />}
            >
              Obras sociales
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/differentials`}
              icon={<Users />}
            >
              Diferenciales
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/bonuses`}
              icon={<Users />}
            >
              Bonificaciones
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/statuses`}
              icon={<Users />}
            >
              Estados
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SidenavSeparator>Ventas</SidenavSeparator>
      <SidenavItem
        href={`/dashboard/company/${props.companyId}/sales`}
        icon={<BadgeDollarSign />}
      >
        Inicio
      </SidenavItem>
      <SidenavItem
        href={`/dashboard/company/${props.companyId}/sales/prospects`}
        icon={<Users />}
      >
        Prospectos
      </SidenavItem>

      <SidenavSeparator>Clientes</SidenavSeparator>
      <SidenavItem
        href={`/dashboard/company/${props.companyId}/clients`}
        icon={<Users />}
      >
        Inicio
      </SidenavItem>

      <SidenavSeparator>Proovedores</SidenavSeparator>

      <SidenavItem
        icon={<Contact />}
        href={`/dashboard/company/${props.companyId}/providers`}
      >
        Inicio
      </SidenavItem>
    </Sidenav>
  );
}
