"use client";
import {
  LayoutDashboardIcon,
  Files,
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
  Phone,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "./ui/accordion";
import { ScrollArea } from "./ui/scroll-area";
import { usePathname } from "next/navigation";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Sidenav, {
  SidenavItem,
  SidenavSeparator,
  SideNavTrigger,
} from "./sidenav";
import { useAuth, useUser } from "@clerk/nextjs";
import { checkRole } from "~/lib/utils/react/roles";
import Inicio from "../../public/sidebar/Frame-1.svg";
export default function CompanySidenav() {
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
    Clientes: "management/client/",
  };
  const isAdmin = checkRole("admin");
  const { has } = useAuth();
  //General
  const canSeeDashboard = has!({ permission: "org:general:dashboard" });
  const canSeeGeneral = canSeeDashboard;

  //Administración

  const canSeeCompanies = has!({ permission: "org:administration:companies" });
  const canSeeProducts = has!({ permission: "org:administration:products" });
  const canSeeChannels = has!({ permission: "org:administration:channels" });
  const canSeeBrands = has!({ permission: "org:administration:brands" });
  const canSeeServices = has!({ permission: "org:administration:services" });
  const canSeeQuotes = has!({ permission: "org:administration:quotes" });

  const canSeeAdministration =
    canSeeCompanies ||
    canSeeProducts ||
    canSeeChannels ||
    canSeeBrands ||
    canSeeServices ||
    canSeeQuotes;

  //Mantenimiento
  const canSeeUser = has!({ permission: "org:maintenance:user" });
  const canSeeRoles = has!({ permission: "org:maintenance:roles" });
  const canSeeTables = has!({ permission: "org:maintenance:tables" });

  const canSeeMaintenance = canSeeUser || canSeeRoles || canSeeTables;

  //Gestion
  //Gestion -> Ventas
  const canSeeAdvisors = has!({ permission: "org:sales:advisors" });
  const canSeeProcedures = has!({ permission: "org:sales:procedures" });
  const canSeePlans = has!({ permission: "org:sales:plans" });
  const canSeeDifferentials = has!({ permission: "org:sales:differentials" });
  const canSeeComissions = has!({ permission: "org:sales:comissions" });
  const canSeeBonuses = has!({ permission: "org:sales:bonuses" });

  const canSeeSales =
    canSeeAdvisors ||
    canSeeProcedures ||
    canSeePlans ||
    canSeeDifferentials ||
    canSeeComissions ||
    canSeeBonuses;

  //Gestion -> Clientes
  const canSeeHealthInsurances = has!({
    permission: "org:client:health_insurances",
  });
  const canSeeAffiliates = has!({ permission: "org:client:affiliates" });

  const canSeeClient = canSeeHealthInsurances || canSeeAffiliates;

  //Gestion -> Proveedores
  //lo ocultamos por ahora
  const canSeeSupliers = false;

  //Gestion -> Documentos
  const canSeeMasiveUpload = has!({
    permission: "org:documents:massive_upload",
  });
  const canSeeRecUpload = has!({ permission: "org:documents:rec_upload" });
  const canSeeOutput = has!({ permission: "org:documents:output" });
  const canSeeResponse = has!({ permission: "org:documents:response" });

  const canSeeDocuments =
    canSeeRecUpload || canSeeRecUpload || canSeeOutput || canSeeResponse;

  const canSeeManagement =
    canSeeSales || canSeeClient || canSeeSupliers || canSeeDocuments;
  //Auditoria
  //lo ocultamos por ahora
  const canSeeAudit = false;

  //Facturacion

  const canSeeManualIssuance = has!({
    permission: "org:billing:manual_issuance",
  });
  const canSeePreLiquidation = has!({
    permission: "org:billing:pre_liquidation",
  });
  const canSeeLiquidation = has!({ permission: "org:billing:liquidation" });
  const canSeeInformation = has!({ permission: "org:billing:information" });
  const canSeeConsults = has!({ permission: "org:billing:consults" });

  const canSeeBilling =
    canSeeManualIssuance ||
    canSeePreLiquidation ||
    canSeeLiquidation ||
    canSeeInformation ||
    canSeeConsults;
  //Tesoreria
  //lo ocultamos por ahora
  const canSeeCC = has!({ permission: "org:treasury:current_count" });
  const canSeePayments = has!({ permission: "org:treasury:payments" });
  const canSeeCollections = has!({ permission: "org:treasury:collection" });

  const canSeeTreasury = canSeeCC || canSeePayments || canSeeCollections;

  // const canSeeBilling = has!({ permission: "org:management:sales" });
  // const canSeeBilling = has!({ permission: "org:management:sales" });
  // const canSeeBilling = has!({ permission: "org:management:sales" });
  // const canSeeBilling = has!({ permission: "org:management:sales" });
  // const canSeeBilling = has!({ permission: "org:management:sales" });
  // const canSeeBilling = has!({ permission: "org:management:sales" });
  // const canSeeBilling = has!({ permission: "org:management:sales" });

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
    <ScrollArea className="h-[99%] w-full relative overflow-x-auto">
      <div className="sticky top-0 bg-white w-full h-1/6 px-6">
        <img
          className="pb-5  pt-6"
          src="/public/bitcom-03.png"
          alt="logo"
        ></img>
      </div>
      <Sidenav className="h-5/6 bg-white px-6">
        <SidenavItem
          className="pl-4"
          href={`/dashboard/home`}
          icon={<img src="/public/sidebar/Frame.png" alt="inicio" />}
          activeIcon={<img src="/public/sidebar/Frame-1.png" alt="inicio" />}
        >
          Inicio
        </SidenavItem>
        {canSeeGeneral && (
          <>
            <div>
              <SidenavSeparator>GENERAL </SidenavSeparator>
            </div>
            <SidenavItem
              icon={
                <LayoutDashboardIcon strokeWidth={1} className="h-7 w-6 " />
              }
              activeIcon={
                <LayoutDashboardIcon
                  strokeWidth={1}
                  className="h-5 w-6 "
                  color="#6952EB"
                />
              }
              href={`/dashboard`}
            >
              Dashboard
            </SidenavItem>
          </>
        )}

        {canSeeManagement && (
          <>
            <div>
              <SidenavSeparator>GESTIÓN</SidenavSeparator>
            </div>

            {canSeeSales && (
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger
                    className={
                      isActive("Ventas")
                        ? "rounded-lg bg-[#BEF0BB] px-1 py-1.5  mb-3 hover:no-underline"
                        : "rounded-lg px-1 py-1.5  mb-3 hover:no-underline"
                    }
                  >
                    <SideNavTrigger
                      icon={
                        <img
                          src="/public/sidebar/Frame-2.png"
                          className="mr-4 h-7"
                        />
                      }
                    >
                      Ventas{" "}
                    </SideNavTrigger>
                  </AccordionTrigger>
                  <AccordionContent className="pl-3">
                    {canSeeAdvisors && (
                      <SidenavItem
                        icon={<UserPlus strokeWidth={1} className="h-6 " />}
                        activeIcon={
                          <UserPlus strokeWidth={1} color="#6952EB" />
                        }
                        href={`/dashboard/management/sales/advisors`}
                        IsChild={true}
                      >
                        Asesores
                      </SidenavItem>
                    )}
                    {canSeeProcedures && (
                      <SidenavItem
                        icon={<FilePlus strokeWidth={1} />}
                        activeIcon={
                          <FilePlus strokeWidth={1} color="#6952EB" />
                        }
                        href={`/dashboard/management/sales/procedures`}
                        IsChild={true}
                      >
                        Tramites
                      </SidenavItem>
                    )}
                    {canSeePlans && (
                      <SidenavItem
                        icon={<MapPin strokeWidth={1} />}
                        activeIcon={<MapPin strokeWidth={1} color="#6952EB" />}
                        href={`/dashboard/management/sales/plans`}
                        IsChild={true}
                      >
                        Planes
                      </SidenavItem>
                    )}
                    {canSeeDifferentials && (
                      <SidenavItem
                        icon={<BarChart2 strokeWidth={1} />}
                        activeIcon={
                          <BarChart2 strokeWidth={1} color="#6952EB" />
                        }
                        href={`/dashboard/management/sales/differentials`}
                        IsChild={true}
                      >
                        Diferenciales
                      </SidenavItem>
                    )}
                    {canSeeComissions && (
                      <SidenavItem
                        icon={<DollarSign strokeWidth={1} />}
                        activeIcon={
                          <DollarSign strokeWidth={1} color="#6952EB" />
                        }
                        href={`/dashboard/management/sales/comissions`}
                        IsChild={true}
                      >
                        Comisiones
                      </SidenavItem>
                    )}
                    {canSeeBonuses && (
                      <SidenavItem
                        icon={<Percent strokeWidth={1} />}
                        activeIcon={<Percent strokeWidth={1} color="#6952EB" />}
                        href={`/dashboard/management/sales/bonuses`}
                        IsChild={true}
                      >
                        Bonificaciones
                      </SidenavItem>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            {canSeeClient && (
              <Accordion type="single" collapsible className="">
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger
                    className={
                      isActive("Clientes")
                        ? "rounded-lg bg-[#BEF0BB] px-1 py-1.5 mb-3 hover:no-underline"
                        : "rounded-lg px-1 py-1.5 mb-3 hover:no-underline"
                    }
                  >
                    <SideNavTrigger
                      icon={
                        <img
                          src="/public/sidebar/Frame-4.png"
                          className="mr-5 h-7"
                        />
                      }
                    >
                      Clientes
                    </SideNavTrigger>
                  </AccordionTrigger>{" "}
                  <AccordionContent className="pl-3">
                    {canSeeAffiliates && (
                      <SidenavItem
                        icon={<UserRound strokeWidth={1} />}
                        activeIcon={
                          <UserRound strokeWidth={1} color="#6952EB" />
                        }
                        href={`/dashboard/management/client/affiliates`}
                        IsChild={true}
                      >
                        Afiliados
                      </SidenavItem>
                    )}
                    {canSeeHealthInsurances && (
                      <SidenavItem
                        icon={<img src="/public/sidebar/Frame-26.png" />}
                        activeIcon={<img src="/public/sidebar/Frame-27.png" />}
                        href={`/dashboard/management/client/health_insurances`}
                        IsChild={true}
                      >
                        Obras sociales
                      </SidenavItem>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {canSeeSupliers && (
              <Accordion type="single" collapsible className="">
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger
                    className={
                      isActive("Proveedores")
                        ? "rounded-lg bg-[#BEF0BB] px-1 py-1.5 mb-3 hover:no-underline"
                        : "rounded-lg px-1 py-1.5 hover:no-underline"
                    }
                  >
                    <SideNavTrigger>Proveedores</SideNavTrigger>
                  </AccordionTrigger>
                  <AccordionContent className="pl-3">
                    <SidenavItem
                      icon={<Bell strokeWidth={1} />}
                      activeIcon={<Bell strokeWidth={1} color="#6952EB" />}
                      href={`/dashboard/management/suppliers/abm`}
                      IsChild={true}
                    >
                      ABM Proveedores
                    </SidenavItem>
                    <SidenavItem
                      icon={<Archive strokeWidth={1} />}
                      activeIcon={<Archive strokeWidth={1} color="#6952EB" />}
                      href={`/dashboard/management/suppliers/comprobants-upload`}
                      IsChild={true}
                    >
                      Alta Comprobantes
                    </SidenavItem>
                    <SidenavItem
                      icon={<Folder strokeWidth={1} />}
                      activeIcon={<Folder strokeWidth={1} color="#6952EB" />}
                      href={`/dashboard/management/suppliers/currentAcounts`}
                      IsChild={true}
                    >
                      Cuentas Corrientes de Proveedores
                    </SidenavItem>
                    <SidenavItem
                      icon={<Globe strokeWidth={1} />}
                      activeIcon={<Globe strokeWidth={1} color="#6952EB" />}
                      href={`/dashboard/management/suppliers/due_dates`}
                      IsChild={true}
                    >
                      Agenda de vencimientos
                    </SidenavItem>
                    <SidenavItem
                      icon={<Heart strokeWidth={1} />}
                      activeIcon={<Heart strokeWidth={1} color="#6952EB" />}
                      href={`/dashboard/management/suppliers/orders`}
                      IsChild={true}
                    >
                      Ordenes de Pago
                    </SidenavItem>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            {canSeeDocuments && (
              <Accordion type="single" collapsible className="">
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger
                    className={
                      isActive("Documentos")
                        ? "rounded-lg bg-[#BEF0BB] px-1 py-1.5 mb-3 hover:no-underline"
                        : "rounded-lg px-1 py-1.5 mb-3 hover:no-underline"
                    }
                  >
                    <SideNavTrigger icon={<Files className="h-5 mr-4" />}>
                      Documentos
                    </SideNavTrigger>
                  </AccordionTrigger>
                  <AccordionContent className="pl-3">
                    {canSeeMasiveUpload && (
                      <SidenavItem
                        icon={<CloudUpload strokeWidth={1} />}
                        activeIcon={
                          <CloudUpload strokeWidth={1} color="#6952EB" />
                        }
                        href={`/dashboard/management/documents/massive-upload`}
                        IsChild={true}
                      >
                        Carga Masiva
                      </SidenavItem>
                    )}
                    {canSeeRecUpload && (
                      <SidenavItem
                        icon={<Cloud strokeWidth={1} />}
                        activeIcon={<Cloud strokeWidth={1} color="#6952EB" />}
                        href={`/dashboard/management/documents/rec-upload`}
                        IsChild={true}
                      >
                        Carga REC
                      </SidenavItem>
                    )}
                    {canSeeOutput && (
                      <SidenavItem
                        icon={<CloudDownload strokeWidth={1} />}
                        activeIcon={
                          <CloudDownload strokeWidth={1} color="#6952EB" />
                        }
                        href={`/dashboard/management/documents/output`}
                        IsChild={true}
                      >
                        Archivos de salida
                      </SidenavItem>
                    )}
                    {canSeeResponse && (
                      <SidenavItem
                        icon={<MessageCircle strokeWidth={1} />}
                        activeIcon={
                          <MessageCircle strokeWidth={1} color="#6952EB" />
                        }
                        href={`/dashboard/management/documents/response`}
                        IsChild={true}
                      >
                        Respuesta
                      </SidenavItem>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </>
        )}
        {canSeeBilling && (
          <>
            <div>
              <SidenavSeparator>FACTURACIÓN</SidenavSeparator>
            </div>

            {canSeeManualIssuance && (
              <SidenavItem
                icon={<img src="/public/sidebar/Frame-6.png" className="" />}
                activeIcon={<img src="/public/sidebar/Frame-7.png" />}
                href={`/dashboard/billing/manual_issuance`}
              >
                Generar manual
              </SidenavItem>
            )}
            {canSeePreLiquidation && (
              <SidenavItem
                icon={<img src="/public/sidebar/Frame-8.png" />}
                activeIcon={<img src="/public/sidebar/Frame-9.png" />}
                href={`/dashboard/billing/pre-liquidation`}
              >
                Pre-Liquidacion
              </SidenavItem>
            )}
            {canSeeLiquidation && (
              <SidenavItem
                icon={<img src="/public/sidebar/Frame-10.png" />}
                activeIcon={<img src="/public/sidebar/Frame-11.png" />}
                href={`/dashboard/billing/liquidation`}
              >
                Liquidacion
              </SidenavItem>
            )}
            {canSeeInformation && (
              <SidenavItem
                icon={<HelpCircle strokeWidth={1} />}
                activeIcon={<HelpCircle strokeWidth={1} color="#6952EB" />}
                href={`/dashboard/billing/information`}
              >
                Informacion
              </SidenavItem>
            )}
            {canSeeConsults && (
              <SidenavItem
                icon={<Search strokeWidth={1} />}
                activeIcon={<Search strokeWidth={1} color="#6952EB" />}
                href={`/dashboard/billing/consults`}
              >
                Consultas
              </SidenavItem>
            )}
          </>
        )}
        {canSeeAdministration && (
          <>
            <div>
              <SidenavSeparator>ADMINISTRACIÓN</SidenavSeparator>
            </div>

            {canSeeCompanies && (
              <SidenavItem
                href={`/dashboard/administration/companies`}
                icon={<BriefcaseBusiness strokeWidth={1} />}
                activeIcon={
                  <BriefcaseBusiness strokeWidth={1} color="#6952EB" />
                }
              >
                Entidades
              </SidenavItem>
            )}
            {canSeeProducts && (
              <SidenavItem
                href={`/dashboard/administration/products`}
                activeIcon={<Package strokeWidth={1} color="#6952EB" />}
                icon={<Package strokeWidth={1} />}
              >
                Productos
              </SidenavItem>
            )}
            {canSeeChannels && (
              <SidenavItem
                href={`/dashboard/administration/channels`}
                activeIcon={<Sliders strokeWidth={1} color="#6952EB" />}
                icon={<Sliders strokeWidth={1} />}
              >
                Canales
              </SidenavItem>
            )}
            {canSeeBrands && (
              <SidenavItem
                href={`/dashboard/administration/brands`}
                activeIcon={<Tag strokeWidth={1} color="#6952EB" />}
                icon={<Tag strokeWidth={1} />}
              >
                Marcas
              </SidenavItem>
            )}
            {canSeeServices && (
              <SidenavItem
                href={`/dashboard/administration/services`}
                activeIcon={<Wrench strokeWidth={1} color="#6952EB" />}
                icon={<Wrench strokeWidth={1} />}
              >
                Servicios
              </SidenavItem>
            )}
            {canSeeQuotes && (
              <SidenavItem
                href={`/dashboard/administration/quotes`}
                icon={<FileText strokeWidth={1} />}
                activeIcon={<FileText strokeWidth={1} color="#6952EB" />}
              >
                Cotizaciones
              </SidenavItem>
            )}
          </>
        )}
        {canSeeMaintenance && (
          <>
            <div>
              <SidenavSeparator>MANTENIMIENTO</SidenavSeparator>
            </div>

            <SidenavItem
              icon={<User strokeWidth={1} />}
              activeIcon={<User strokeWidth={1} color="#6952EB" />}
              href={`/dashboard/maintenance/user`}
            >
              Usuarios
            </SidenavItem>
            <SidenavItem
              icon={<Shield strokeWidth={1} />}
              href={`/dashboard/maintenance/roles`}
              activeIcon={<Shield strokeWidth={1} color="#6952EB" />}
            >
              Roles
            </SidenavItem>
            <SidenavItem
              icon={<Grid strokeWidth={1} />}
              activeIcon={<Grid strokeWidth={1} color="#6952EB" />}
              href={`/dashboard/maintenance/tables`}
            >
              Tablas
            </SidenavItem>
          </>
        )}

        {canSeeAudit && (
          <>
            <div>
              <SidenavSeparator>Auditoria</SidenavSeparator>
            </div>

            <SidenavItem
              href={`/dashboard/audit/administrative`}
              icon={<Clipboard />}
              activeIcon={<Clipboard color="#6952EB" />}
            >
              Administrativo
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/audit/medical`}
              icon={<Activity strokeWidth={1} />}
              activeIcon={<Activity strokeWidth={1} color="#6952EB" />}
            >
              Medico
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/audit/telefonica`}
              icon={<Phone strokeWidth={1} />}
              activeIcon={<Phone strokeWidth={1} color="#6952EB" />}
            >
              Telefonica
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/audit/benefits`}
              icon={<Gift strokeWidth={1} />}
              activeIcon={<Gift strokeWidth={1} color="#6952EB" />}
            >
              Prestaciones
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/audit/fixed_eventual`}
              icon={<Calendar strokeWidth={1} />}
              activeIcon={<Calendar strokeWidth={1} color="#6952EB" />}
            >
              Eventuales/Fijos
            </SidenavItem>
            <SidenavItem
              href={`/dashboard/audit/operations`}
              icon={<Settings strokeWidth={1} />}
              activeIcon={<Settings strokeWidth={1} color="#6952EB" />}
            >
              Operaciones
            </SidenavItem>
          </>
        )}

        {canSeeTreasury && (
          <>
            <div>
              <SidenavSeparator>TESORERIA</SidenavSeparator>
            </div>

            {canSeeCC && (
              <SidenavItem
                icon={<Database strokeWidth={1} />}
                activeIcon={<Database strokeWidth={1} color="#6952EB" />}
                href={`/dashboard/treasury/current_count`}
              >
                Cuenta Corriente
              </SidenavItem>
            )}
            {canSeeCollections && (
              <SidenavItem
                icon={<Hand strokeWidth={1} />}
                activeIcon={<Hand strokeWidth={1} color="#6952EB" />}
                href={`/dashboard/treasury/collection`}
              >
                Cobranzas
              </SidenavItem>
            )}
            {canSeePayments && (
              <SidenavItem
                icon={<Wallet strokeWidth={1} />}
                activeIcon={<Wallet strokeWidth={1} color="#6952EB" />}
                href={`/dashboard/treasury/payments`}
              >
                Pagos
              </SidenavItem>
            )}
          </>
        )}
      </Sidenav>
    </ScrollArea>
  );
}
