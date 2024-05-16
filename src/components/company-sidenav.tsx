"use client";
import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";
import {
  ActivitySquareIcon,
  FileUpIcon,
  LayoutDashboardIcon,
  BadgeDollarSign,
  Contact,
  Users,
  LayoutPanelLeft,
  Boxes,
  HeartPulse,
  Option,
  Gem,
  NotebookPen,
  Blend,
} from "lucide-react";
import { Notebook } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "./ui/accordion";
import { usePathname } from "next/navigation";

export default function CompanySidenav(props: { companyId: string }) {
  const menu: Record<string, string> = {
    Administracion: "administration/",
    Gestion: "management/",
    Mantenimimento: "maintenance/",
    General: "general/",
    Auditoria: "audit/",
    Tesoreria: "treasury/",
    Facturacion: "billing/",
  };
  const pathname = usePathname();
  const isActive = (href: keyof typeof menu) => {
    if (href !== undefined) {
      if (href in menu) {
        const menuValue = menu[href];
        if (menuValue !== undefined) {
          return pathname.includes(menuValue);
        }
      }
    }
  };
  return (
    <Sidenav className="h-full bg-[#e9fcf8]">
      <img
        className="bg-[#e9fcf8] pb-5 pl-5 pr-5 pt-8"
        src="https://utfs.io/f/2241aac5-d6d9-4310-bc31-db91cf5565cb-j8i4q3.png"
        alt="logo"
      ></img>
      <Accordion type="single" className="pl-5 pr-5 pt-5" collapsible>
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger
            className={
              isActive("General")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>General </SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              icon={<LayoutDashboardIcon />}
              href={`/dashboard/company/${props.companyId}/general/dashboard`}
            >
              Dashboard
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" className="border-none">
          <AccordionTrigger
            className={
              isActive("Administracion")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Administracion</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/start`}
              icon={<LayoutPanelLeft />}
            >
              Inicio
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/providers`}
              icon={<Users />}
            >
              Compañias
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/plans`}
              icon={<Notebook />}
            >
              Productos
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/modos`}
              icon={<Blend />}
            >
              Canales
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/bussiness_units`}
              icon={<Boxes />}
            >
              Marcas
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/health_insurances`}
              icon={<HeartPulse />}
            >
              Obras sociales
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/services`}
              icon={<Option />}
            >
              Servicios
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/bonuses`}
              icon={<Gem />}
            >
              Cotizaciones
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="border-none">
          <AccordionTrigger
            className={
              isActive("Mantenimiento")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline "
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Mantenimiento</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              icon={<FileUpIcon />}
              href={`/dashboard/company/${props.companyId}/gestion/uploads`}
            >
              Usuarios
            </SidenavItem>
            <SidenavItem
              icon={<ActivitySquareIcon />}
              href={`/dashboard/company/${props.companyId}/roles`}
            >
              Roles
            </SidenavItem>
            <SidenavItem
              icon={<Users />}
              href={`/dashboard/company/${props.companyId}/support`}
            >
              Tablas
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4" className="border-none">
          <AccordionTrigger
            className={
              isActive("Gestion")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Gestion</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/sales/sales`}
              icon={<BadgeDollarSign />}
            >
              Ventas
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/sales/procedures`}
              icon={<Users />}
            >
              Clientes
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/sales/procedures`}
              icon={<Users />}
            >
              Proveedores
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/sales/procedures`}
              icon={<Users />}
            >
              Documentos
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="border-none">
          <AccordionTrigger
            className={
              isActive("Auditoria")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Auditoria</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/clients/clients`}
              icon={<Users />}
            >
              Afiliaciones
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/clients/clients`}
              icon={<Users />}
            >
              Beneficios
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/clients/clients`}
              icon={<Users />}
            >
              Eventuales/Fijos
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/clients/clients`}
              icon={<Users />}
            >
              Operaciones
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6" className="border-none">
          <AccordionTrigger
            className={
              isActive("Facturacion")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Facturacion</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              icon={<Contact />}
              href={`/dashboard/company/${props.companyId}/billing/manual_issuance`}
            >
              Generar manual
            </SidenavItem>
            <SidenavItem
              icon={<Contact />}
              href={`/dashboard/company/${props.companyId}/billing/liquidation`}
            >
              Pre-Liquidacion
            </SidenavItem>
            <SidenavItem
              icon={<Contact />}
              href={`/dashboard/company/${props.companyId}/billing/consults`}
            >
              Consultas
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-7" className="border-none">
          <AccordionTrigger
            className={
              isActive("Tesoreria")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Tesoreria</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              icon={<Contact />}
              href={`/dashboard/company/${props.companyId}/treasury/current_count`}
            >
              Cuenta actual
            </SidenavItem>
            <SidenavItem
              icon={<Contact />}
              href={`/dashboard/company/${props.companyId}/treasury/collection`}
            >
              Recoleccion
            </SidenavItem>
            <SidenavItem
              icon={<Contact />}
              href={`/dashboard/company/${props.companyId}/treasury/payments`}
            >
              Pagos
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Sidenav>
  );
}
