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
    Administracion: "administration",
    "Gestión de documentos": "management",
    General: "general",
    Clientes: "clients",
    Proveedores: "providers",
    Ventas: "sales",
  };
  const pathname = usePathname();
  const isActive = (href: keyof typeof menu) => {
    console.log("ejecutado");
    if (href !== undefined) {
      if (href in menu) {
        const menuValue = menu[href];
        if (menuValue !== undefined) {
          console.log(
            "el menu.href es ",
            menu[href],
            pathname.includes(menuValue),
          );
          return pathname.includes(menuValue);
        }
      }
    }
  };
  return (
    <Sidenav>
      <Accordion type="single" className="pl-5 pr-5" collapsible>
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger
            className={
              isActive("General")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>General </SidenavSeparator>
            <SidenavSeparator>
              {isActive("General" ? "Casa" : "Nop")}
            </SidenavSeparator>
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
        <AccordionItem value="item-2" className="border-none">
          <AccordionTrigger
            className={
              isActive("Gestión de documentos")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Gestión de documentos</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              icon={<FileUpIcon />}
              href={`/dashboard/company/${props.companyId}/management/uploads`}
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
              Proveedores
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/plans`}
              icon={<Notebook />}
            >
              Planes
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/bussiness_units`}
              icon={<Boxes />}
            >
              Unidades de negocio
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/health-insurance`}
              icon={<HeartPulse />}
            >
              Obras sociales
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/differentials`}
              icon={<Option />}
            >
              Diferenciales
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/bonuses`}
              icon={<Gem />}
            >
              Bonificaciones
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/administration/statuses`}
              icon={<NotebookPen />}
            >
              Estados
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4" className="border-none">
          <AccordionTrigger
            className={
              isActive("Ventas")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Ventas</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="border-none">
          <AccordionTrigger
            className={
              isActive("Clientes")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Clientes</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              href={`/dashboard/company/${props.companyId}/clients`}
              icon={<Users />}
            >
              Inicio
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6" className="border-none">
          <AccordionTrigger
            className={
              isActive("Proveedores")
                ? "rounded-lg bg-[#1bdfb7] px-1 py-1.5 hover:no-underline"
                : "rounded-lg px-1 py-1.5 hover:no-underline"
            }
          >
            <SidenavSeparator>Proveedores</SidenavSeparator>
          </AccordionTrigger>
          <AccordionContent>
            <SidenavItem
              icon={<Contact />}
              href={`/dashboard/company/${props.companyId}/providers/start`}
            >
              Inicio
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Sidenav>
  );
}
