"use client";
import {
  LayoutDashboardIcon,
  Contact,
  Users,
  BriefcaseBusiness,
  Package,
  Sliders,
  Tag,
  Wrench,
  FileText,
  User,
  Shield,
  Grid,
  ShoppingCart,
  Truck,
  File,
  Activity,
  Clipboard,
  Gift,
  Calendar,
  Settings,
  UserPlus,
  FilePlus,
  BarChart2,
  Percent,
  DollarSign,
  MapPin,
  CloudUpload,
  Cloud,
  CloudDownload,
  MessageCircle,
  BookOpen,
  Clock,
  CreditCard,
  HelpCircle,
  Database,
  Hand,
  Wallet,
  Search,
  Bell,
  Archive,
  Folder,
  Globe,
  Heart,
  UserRound,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "./ui/accordion";
import { usePathname } from "next/navigation";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";

export default function CompanySidenav(props: { companyId: string }) {
  const menu: Record<string, string> = {
    Administracion: "administration/",
    Gestion: "management/",
    Mantenimimento: "maintenance/",
    General: "general/",
    Auditoria: "audit/",
    Tesoreria: "treasury/",
    Facturacion: "billing/",
    Ventas: "management/sales/",
    Proveedores: "management/suppliers/",
    Documentos: "management/documents/",
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
      <Accordion
        type="single"
        className="bg-[#e9fcf8] pl-5 pr-5 pt-5"
        collapsible
      >
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
            <SidenavItem icon={<LayoutDashboardIcon />} href={`/dashboard`}>
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
              href={`/dashboard/administration/companies`}
              icon={<BriefcaseBusiness />}
            >
              Entidades
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/administration/products`}
              icon={<Package />}
            >
              Productos
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/administration/channels`}
              icon={<Sliders />}
            >
              Canales
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/administration/brands`}
              icon={<Tag />}
            >
              Marcas
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/administration/services`}
              icon={<Wrench />}
            >
              Servicios
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/administration/quotes`}
              icon={<FileText />}
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
            <SidenavItem icon={<User />} href={`/dashboard/maintenance/user`}>
              Usuarios
            </SidenavItem>
            <SidenavItem
              icon={<Shield />}
              href={`/dashboard/maintenance/roles`}
            >
              Roles
            </SidenavItem>
            <SidenavItem icon={<Grid />} href={`/dashboard/maintenance/tables`}>
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
            <Accordion type="single" collapsible className="pl-3">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger
                  className={
                    isActive("Ventas")
                      ? "rounded-lg bg-[#9ef4e3] px-1 py-1.5 hover:no-underline"
                      : "rounded-lg px-1 py-1.5 hover:no-underline"
                  }
                >
                  <SidenavSeparator>Ventas </SidenavSeparator>
                </AccordionTrigger>
                <AccordionContent>
                  <SidenavItem
                    icon={<UserPlus />}
                    href={`/dashboard/management/sales/advisors`}
                  >
                    Asesores
                  </SidenavItem>
                  <SidenavItem
                    icon={<FilePlus />}
                    href={`/dashboard/management/sales/procedures`}
                  >
                    Tramites
                  </SidenavItem>
                  <SidenavItem
                    icon={<MapPin />}
                    href={`/dashboard/management/sales/plans`}
                  >
                    Planes
                  </SidenavItem>
                  <SidenavItem
                    icon={<BarChart2 />}
                    href={`/dashboard/management/sales/differentials`}
                  >
                    Diferenciales
                  </SidenavItem>
                  <SidenavItem
                    icon={<DollarSign />}
                    href={`/dashboard/management/sales/comissions`}
                  >
                    Comisiones
                  </SidenavItem>
                  <SidenavItem
                    icon={<Percent />}
                    href={`/dashboard/management/sales/bonuses`}
                  >
                    Bonificaciones
                  </SidenavItem>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible className="pl-3">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger
                  className={
                    isActive("Clientes")
                      ? "rounded-lg bg-[#9ef4e3] px-1 py-1.5 hover:no-underline"
                      : "rounded-lg px-1 py-1.5 hover:no-underline"
                  }
                >
                  <SidenavSeparator>Clientes</SidenavSeparator>
                </AccordionTrigger>
                <AccordionContent>
                  <SidenavItem
                    icon={<UserRound />}
                    href={`/dashboard/management/client/affiliates`}
                  >
                    Afiliados
                  </SidenavItem>
                  <SidenavItem
                    icon={<Users />}
                    href={`/dashboard/management/client/health_insurances`}
                  >
                    Obras sociales
                  </SidenavItem>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible className="pl-3">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger
                  className={
                    isActive("Proveedores")
                      ? "rounded-lg bg-[#9ef4e3] px-1 py-1.5 hover:no-underline"
                      : "rounded-lg px-1 py-1.5 hover:no-underline"
                  }
                >
                  <SidenavSeparator>Proveedores</SidenavSeparator>
                </AccordionTrigger>
                <AccordionContent>
                  <SidenavItem
                    icon={<Bell />}
                    href={`/dashboard/management/suppliers/abm`}
                  >
                    ABM Proveedores
                  </SidenavItem>
                  <SidenavItem
                    icon={<Archive />}
                    href={`/dashboard/management/suppliers/comprobants-upload`}
                  >
                    Alta Comprobantes
                  </SidenavItem>
                  <SidenavItem
                    icon={<Folder />}
                    href={`/dashboard/management/suppliers/currentAcounts`}
                  >
                    Cuentas Corrientes de Proveedores
                  </SidenavItem>
                  <SidenavItem
                    icon={<Globe />}
                    href={`/dashboard/management/suppliers/due_dates`}
                  >
                    Agenda de vencimientos
                  </SidenavItem>
                  <SidenavItem
                    icon={<Heart />}
                    href={`/dashboard/management/suppliers/orders`}
                  >
                    Ordenes de Pago
                  </SidenavItem>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible className="pl-3">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger
                  className={
                    isActive("Documentos")
                      ? "rounded-lg bg-[#9ef4e3] px-1 py-1.5 hover:no-underline"
                      : "rounded-lg px-1 py-1.5 hover:no-underline"
                  }
                >
                  <SidenavSeparator>Documentos</SidenavSeparator>
                </AccordionTrigger>
                <AccordionContent>
                  <SidenavItem
                    icon={<CloudUpload />}
                    href={`/dashboard/management/documents/massive-upload`}
                  >
                    Carga Masiva
                  </SidenavItem>
                  <SidenavItem
                    icon={<Cloud />}
                    href={`/dashboard/management/documents/rec-upload`}
                  >
                    Carga REC
                  </SidenavItem>
                  <SidenavItem
                    icon={<CloudDownload />}
                    href={`/dashboard/management/documents/output`}
                  >
                    Archivos de salida
                  </SidenavItem>
                  <SidenavItem
                    icon={<MessageCircle />}
                    href={`/dashboard/management/documents/response`}
                  >
                    Respuesta
                  </SidenavItem>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
              href={`/dashboard/audit/administrative`}
              icon={<Clipboard />}
            >
              Administrativo
            </SidenavItem>
            <SidenavItem href={`/dashboard/audit/medical`} icon={<Activity />}>
              Medico
            </SidenavItem>

            <SidenavItem href={`/dashboard/audit/benefits`} icon={<Gift />}>
              Beneficios por prestaciones
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/audit/fixed_eventual`}
              icon={<Calendar />}
            >
              Eventuales/Fijos
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/audit/operations`}
              icon={<Settings />}
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
              icon={<FilePlus />}
              href={`/dashboard/billing/manual_issuance`}
            >
              Generar manual
            </SidenavItem>
            <SidenavItem
              icon={<Clock />}
              href={`/dashboard/billing/pre-liquidation`}
            >
              Pre-Liquidacion
            </SidenavItem>
            <SidenavItem
              icon={<CreditCard />}
              href={`/dashboard/billing/liquidation`}
            >
              Liquidacion
            </SidenavItem>
            <SidenavItem
              icon={<HelpCircle />}
              href={`/dashboard/billing/information`}
            >
              Informacion
            </SidenavItem>
            <SidenavItem icon={<Search />} href={`/dashboard/billing/consults`}>
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
              icon={<Database />}
              href={`/dashboard/treasury/current_count`}
            >
              Cuenta Corriente
            </SidenavItem>
            <SidenavItem
              icon={<Hand />}
              href={`/dashboard/treasury/collection`}
            >
              Cobranzas
            </SidenavItem>
            <SidenavItem
              icon={<Wallet />}
              href={`/dashboard/treasury/payments`}
            >
              Pagos
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Sidenav>
  );
}
