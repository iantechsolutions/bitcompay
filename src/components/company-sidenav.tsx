'use client'
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
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "./ui/accordion";
import { usePathname } from "next/navigation";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

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
            <SidenavItem
              icon={<LayoutDashboardIcon />}
              href={`/dashboard/${props.companyId}/general`}
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
              href={`/dashboard/${props.companyId}/administration/companies`}
              icon={<BriefcaseBusiness />}
            >
              Compañias
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/${props.companyId}/administration/products`}
              icon={<Package />}
            >
              Productos
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/${props.companyId}/administration/channels`}
              icon={<Sliders />}
            >
              Canales
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/${props.companyId}/administration/brands`}
              icon={<Tag />}
            >
              Marcas
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/${props.companyId}/administration/services`}
              icon={<Wrench />}
            >
              Servicios
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/${props.companyId}/administration/quotes`}
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
            <SidenavItem
              icon={<User />}
              href={`/dashboard/${props.companyId}/maintenance/user`}
            >
              Usuarios
            </SidenavItem>
            <SidenavItem
              icon={<Shield />}
              href={`/dashboard/${props.companyId}/maintenance/roles`}
            >
              Roles
            </SidenavItem>
            <SidenavItem
              icon={<Grid />}
              href={`/dashboard/${props.companyId}/maintenance/tables`}
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
                    href={`/dashboard/${props.companyId}/management/sales/advisors`}
                  >
                    Asesores
                  </SidenavItem>
                  <SidenavItem
                    icon={<FilePlus />}
                    href={`/dashboard/${props.companyId}/management/sales/procedures`}
                  >
                    Tramites
                  </SidenavItem>
                  <SidenavItem
                    icon={<MapPin />}
                    href={`/dashboard/${props.companyId}/management/sales/plans`}
                  >
                    Planes
                  </SidenavItem>
                  <SidenavItem
                    icon={<BarChart2 />}
                    href={`/dashboard/${props.companyId}/management/sales/differentials`}
                  >
                    Diferenciales
                  </SidenavItem>
                  <SidenavItem
                    icon={<DollarSign />}
                    href={`/dashboard/${props.companyId}/management/sales/comissions`}
                  >
                    Comisiones
                  </SidenavItem>
                  <SidenavItem
                    icon={<Percent />}
                    href={`/dashboard/${props.companyId}/management/sales/bonuses`}
                  >
                    Bonificaciones
                  </SidenavItem>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <SidenavItem
              href={`/dashboard/${props.companyId}/management/client`}
              icon={<Users />}
            >
              Clientes
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/${props.companyId}/management/suppliers`}
              icon={<Truck />}
            >
              Proveedores
            </SidenavItem>
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
                    href={`/dashboard/${props.companyId}/management/documents/massive-upload`}
                  >
                    Carga Masiva
                  </SidenavItem>
                  <SidenavItem
                    icon={<Cloud />}
                    href={`/dashboard/${props.companyId}/management/documents/rec-upload`}
                  >
                    Carga REC
                  </SidenavItem>
                  <SidenavItem
                    icon={<CloudDownload />}
                    href={`/dashboard/${props.companyId}/management/documents/output`}
                  >
                    Archivos de salida
                  </SidenavItem>
                  <SidenavItem
                    icon={<MessageCircle />}
                    href={`/dashboard/${props.companyId}/management/documents/response`}
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
              href={`/dashboard/${props.companyId}/audit/administrative`}
              icon={<Clipboard />}
            >
              Administrativo
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/${props.companyId}/audit/medical`}
              icon={<Activity />}
            >
              Medico
            </SidenavItem>

            <SidenavItem
              href={`/dashboard/${props.companyId}/audit/benefits`}
              icon={<Gift />}
            >
              Beneficios
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/${props.companyId}/audit/fixed_eventual`}
              icon={<Calendar />}
            >
              Eventuales/Fijos
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/${props.companyId}/audit/operations`}
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
              href={`/dashboard/${props.companyId}/billing/manual_issuance`}
            >
              Generar manual
            </SidenavItem>
            <SidenavItem
              icon={<Clock />}
              href={`/dashboard/${props.companyId}/billing/pre-liquidation`}
            >
              Pre-Liquidacion
            </SidenavItem>
            <SidenavItem
              icon={<CreditCard />}
              href={`/dashboard/${props.companyId}/billing/liquidation`}
            >
              Liquidacion
            </SidenavItem>
            <SidenavItem
              icon={<HelpCircle />}
              href={`/dashboard/${props.companyId}/billing/information`}
            >
              Informacion
            </SidenavItem>
            <SidenavItem
              icon={<Search />}
              href={`/dashboard/${props.companyId}/billing/consults`}
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
              icon={<Database />}
              href={`/dashboard/${props.companyId}/treasury/current_count`}
            >
              Cuenta actual
            </SidenavItem>
            <SidenavItem
              icon={<Hand />}
              href={`/dashboard/${props.companyId}/treasury/collection`}
            >
              Recoleccion
            </SidenavItem>
            <SidenavItem
              icon={<Wallet />}
              href={`/dashboard/${props.companyId}/treasury/payments`}
            >
              Pagos
            </SidenavItem>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Sidenav>
  );
}
