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
import Sidenav, { SidenavItem, SidenavSeparator } from "./sidenav";
import { useAuth, useUser } from "@clerk/nextjs";
import { checkRole } from "~/lib/utils/react/roles";

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
  const canSeeTreasury = has!({ permission: "org:treasury:collection" });

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
    <Sidenav className="h-full bg-[#e9fcf8]">
      <img
        className="bg-[#e9fcf8] pb-5 pl-5 pr-5 pt-8"
        src="/public/bitcom-03.png"
        alt="logo"
      ></img>
      <ScrollArea className="h-5/6">
        <Accordion type="multiple" className="bg-[#e9fcf8] pl-5 pr-5 pt-5">
          {canSeeGeneral && (
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
          )}
          {canSeeAdministration && (
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
                {canSeeCompanies && (
                  <SidenavItem
                    href={`/dashboard/administration/companies`}
                    icon={<BriefcaseBusiness />}
                  >
                    Entidades
                  </SidenavItem>
                )}
                {canSeeProducts && (
                  <SidenavItem
                    href={`/dashboard/administration/products`}
                    icon={<Package />}
                  >
                    Productos
                  </SidenavItem>
                )}
                {canSeeChannels && (
                  <SidenavItem
                    href={`/dashboard/administration/channels`}
                    icon={<Sliders />}
                  >
                    Canales
                  </SidenavItem>
                )}
                {canSeeBrands && (
                  <SidenavItem
                    href={`/dashboard/administration/brands`}
                    icon={<Tag />}
                  >
                    Marcas
                  </SidenavItem>
                )}
                {canSeeServices && (
                  <SidenavItem
                    href={`/dashboard/administration/services`}
                    icon={<Wrench />}
                  >
                    Servicios
                  </SidenavItem>
                )}
                {canSeeQuotes && (
                  <SidenavItem
                    href={`/dashboard/administration/quotes`}
                    icon={<FileText />}
                  >
                    Cotizaciones
                  </SidenavItem>
                )}
              </AccordionContent>
            </AccordionItem>
          )}
          {canSeeMaintenance && (
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
                  href={`/dashboard/maintenance/user`}
                >
                  Usuarios
                </SidenavItem>
                <SidenavItem
                  icon={<Shield />}
                  href={`/dashboard/maintenance/roles`}
                >
                  Roles
                </SidenavItem>
                <SidenavItem
                  icon={<Grid />}
                  href={`/dashboard/maintenance/tables`}
                >
                  Tablas
                </SidenavItem>
              </AccordionContent>
            </AccordionItem>
          )}
          {canSeeManagement && (
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
                {canSeeSales && (
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
                        {canSeeAdvisors && (
                          <SidenavItem
                            icon={<UserPlus />}
                            href={`/dashboard/management/sales/advisors`}
                          >
                            Asesores
                          </SidenavItem>
                        )}
                        {canSeeProcedures && (
                          <SidenavItem
                            icon={<FilePlus />}
                            href={`/dashboard/management/sales/procedures`}
                          >
                            Tramites
                          </SidenavItem>
                        )}
                        {canSeePlans && (
                          <SidenavItem
                            icon={<MapPin />}
                            href={`/dashboard/management/sales/plans`}
                          >
                            Planes
                          </SidenavItem>
                        )}
                        {canSeeDifferentials && (
                          <SidenavItem
                            icon={<BarChart2 />}
                            href={`/dashboard/management/sales/differentials`}
                          >
                            Diferenciales
                          </SidenavItem>
                        )}
                        {canSeeComissions && (
                          <SidenavItem
                            icon={<DollarSign />}
                            href={`/dashboard/management/sales/comissions`}
                          >
                            Comisiones
                          </SidenavItem>
                        )}
                        {canSeeBonuses && (
                          <SidenavItem
                            icon={<Percent />}
                            href={`/dashboard/management/sales/bonuses`}
                          >
                            Bonificaciones
                          </SidenavItem>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                {canSeeClient && (
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
                      </AccordionTrigger>{" "}
                      <AccordionContent>
                        {canSeeAffiliates && (
                          <SidenavItem
                            icon={<UserRound />}
                            href={`/dashboard/management/client/affiliates`}
                          >
                            Afiliados
                          </SidenavItem>
                        )}
                        {canSeeHealthInsurances && (
                          <SidenavItem
                            icon={<Users />}
                            href={`/dashboard/management/client/health_insurances`}
                          >
                            Obras sociales
                          </SidenavItem>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {canSeeSupliers && (
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
                )}
                {canSeeDocuments && (
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
                        {canSeeMasiveUpload && (
                          <SidenavItem
                            icon={<CloudUpload />}
                            href={`/dashboard/management/documents/massive-upload`}
                          >
                            Carga Masiva
                          </SidenavItem>
                        )}
                        {canSeeRecUpload && (
                          <SidenavItem
                            icon={<Cloud />}
                            href={`/dashboard/management/documents/rec-upload`}
                          >
                            Carga REC
                          </SidenavItem>
                        )}
                        {canSeeOutput && (
                          <SidenavItem
                            icon={<CloudDownload />}
                            href={`/dashboard/management/documents/output`}
                          >
                            Archivos de salida
                          </SidenavItem>
                        )}
                        {canSeeResponse && (
                          <SidenavItem
                            icon={<MessageCircle />}
                            href={`/dashboard/management/documents/response`}
                          >
                            Respuesta
                          </SidenavItem>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </AccordionContent>
            </AccordionItem>
          )}
          {canSeeAudit && (
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
                <SidenavItem
                  href={`/dashboard/audit/medical`}
                  icon={<Activity />}
                >
                  Medico
                </SidenavItem>
                <SidenavItem
                  href={`/dashboard/audit/telefonica`}
                  icon={<Phone />}
                >
                  Telefonica
                </SidenavItem>
                <SidenavItem href={`/dashboard/audit/benefits`} icon={<Gift />}>
                  Prestaciones
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
          )}
          {canSeeBilling && (
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
                {canSeeManualIssuance && (
                  <SidenavItem
                    icon={<FilePlus />}
                    href={`/dashboard/billing/manual_issuance`}
                  >
                    Generar manual
                  </SidenavItem>
                )}
                {canSeePreLiquidation && (
                  <SidenavItem
                    icon={<Clock />}
                    href={`/dashboard/billing/pre-liquidation`}
                  >
                    Pre-Liquidacion
                  </SidenavItem>
                )}
                {canSeeLiquidation && (
                  <SidenavItem
                    icon={<CreditCard />}
                    href={`/dashboard/billing/liquidation`}
                  >
                    Liquidacion
                  </SidenavItem>
                )}
                {canSeeInformation && (
                  <SidenavItem
                    icon={<HelpCircle />}
                    href={`/dashboard/billing/information`}
                  >
                    Informacion
                  </SidenavItem>
                )}
                {canSeeConsults && (
                  <SidenavItem
                    icon={<Search />}
                    href={`/dashboard/billing/consults`}
                  >
                    Consultas
                  </SidenavItem>
                )}
              </AccordionContent>
            </AccordionItem>
          )}
          {canSeeTreasury && (
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
          )}
        </Accordion>
      </ScrollArea>
    </Sidenav>
  );
}
