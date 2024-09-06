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
import path from "path";
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
    <ScrollArea className="h-[99vh] w-full relative overflow-x-auto">
      <div className="sticky top-0 bg-white w-full h-[11vh] px-[1vw] items-center justify-center content-center text-center">
        <img
          className="h-[10vh] pb-[1vh] pt-[2vh] mx-auto my-auto"
          src="/public/bitcom-03.png"
          alt="logo"
        />
      </div>
      <Sidenav className="w-[20vw] bg-white px-[1vw] pl-[2vw]">
        <SidenavItem
          className="w-[11vw]  bg-white pl-[1vw] text-sideNav"
          href={`/dashboard/home`}
          icon={
            <img
              src="/public/sidebar/Frame.png"
              alt="inicio"
              className="w-[2vw] h-auto  "
            />
          }
          activeIcon={
            <img
              src="/public/sidebar/Frame-1.png"
              alt="inicio"
              className="w-[2vw] h-auto "
            />
          }>
          Inicio
        </SidenavItem>
        {canSeeGeneral && (
          <>
            <div>
              <SidenavSeparator className="text-sideNav">
                GENERAL{" "}
              </SidenavSeparator>
            </div>
            <SidenavItem
              className="flex text-sideNav gap-[0vw] "
              icon={
                <LayoutDashboardIcon
                  strokeWidth={1}
                  className="w-[1.5vw] h-auto"
                />
              }
              activeIcon={
                <LayoutDashboardIcon
                  strokeWidth={1}
                  className="w-[1.5vw] h-auto"
                  color="#6952EB"
                />
              }
              href={`/dashboard`}>
              Dashboard
            </SidenavItem>
          </>
        )}
        {canSeeAdministration && (
          <>
            <div>
              <SidenavSeparator className="text-sideNav">
                ADMINISTRACIÓN
              </SidenavSeparator>
            </div>

            {canSeeCompanies && (
              <SidenavItem
                href={`/administration/companies`}
                icon={
                  <BriefcaseBusiness
                    strokeWidth={1}
                    className="w-[1.5vw] h-auto"
                  />
                }
                activeIcon={
                  <BriefcaseBusiness
                    strokeWidth={1}
                    color="#6952EB"
                    className="w-[1.5vw] h-auto"
                  />
                }
                className="text-sideNav">
                Entidades
              </SidenavItem>
            )}
            {canSeeProducts && (
              <SidenavItem
                href={`/administration/products`}
                activeIcon={
                  <Package
                    strokeWidth={1}
                    color="#6952EB"
                    className="w-[1.5vw] h-auto"
                  />
                }
                icon={<Package strokeWidth={1} className="w-[1.5vw] h-auto" />}
                className="text-sideNav">
                Productos
              </SidenavItem>
            )}
            {canSeeChannels && (
              <SidenavItem
                href={`/administration/channels`}
                activeIcon={
                  <Sliders
                    strokeWidth={1}
                    color="#6952EB"
                    className="w-[1.5vw] h-auto"
                  />
                }
                icon={<Sliders strokeWidth={1} className="w-[1.5vw] h-auto" />}
                className="text-sideNav">
                Canales
              </SidenavItem>
            )}
            {canSeeBrands && (
              <SidenavItem
                href={`/administration/brands`}
                activeIcon={
                  <Tag
                    strokeWidth={1}
                    color="#6952EB"
                    className="w-[1.5vw] h-auto"
                  />
                }
                icon={<Tag strokeWidth={1} className="w-[1.5vw] h-auto" />}
                className="text-sideNav">
                Marcas
              </SidenavItem>
            )}
            {canSeeServices && (
              <SidenavItem
                href={`/administration/services`}
                activeIcon={
                  <Wrench
                    strokeWidth={1}
                    color="#6952EB"
                    className="w-[1.5vw] h-auto"
                  />
                }
                icon={<Wrench strokeWidth={1} className="w-[1.5vw] h-auto" />}
                className="text-sideNav">
                Servicios
              </SidenavItem>
            )}
            {canSeeQuotes && (
              <SidenavItem
                href={`/administration/quotes`}
                icon={<FileText strokeWidth={1} className="w-[1.5vw] h-auto" />}
                activeIcon={
                  <FileText
                    strokeWidth={1}
                    color="#6952EB"
                    className="w-[1.5vw] h-auto"
                  />
                }
                className="text-sideNav">
                Cotizaciones
              </SidenavItem>
            )}
          </>
        )}
        {canSeeMaintenance && (
          <>
            <div>
              <SidenavSeparator className="text-sideNav">
                MANTENIMIENTO
              </SidenavSeparator>
            </div>

            <SidenavItem
              icon={<User strokeWidth={1} className="w-[1.5vw] h-auto" />}
              activeIcon={
                <User
                  strokeWidth={1}
                  color="#6952EB"
                  className="w-[1.5vw] h-auto"
                />
              }
              href={`/maintenance/user`}
              className="text-sideNav">
              Usuarios
            </SidenavItem>
            <SidenavItem
              icon={<Shield strokeWidth={1} className="w-[1.5vw] h-auto" />}
              href={`/maintenance/roles`}
              activeIcon={
                <Shield
                  strokeWidth={1}
                  color="#6952EB"
                  className="w-[1.5vw] h-auto"
                />
              }
              className="text-sideNav">
              Roles
            </SidenavItem>
            <SidenavItem
              icon={<Grid strokeWidth={1} className="w-[1.5vw] h-auto" />}
              activeIcon={
                <Grid
                  strokeWidth={1}
                  color="#6952EB"
                  className="w-[1.5vw] h-auto"
                />
              }
              href={`/maintenance/tables`}
              className="text-sideNav">
              Tablas
            </SidenavItem>
          </>
        )}
        {canSeeManagement && (
          <>
            <div>
              <SidenavSeparator className="text-sideNav">
                GESTIÓN
              </SidenavSeparator>
            </div>

            {canSeeSales && (
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger
                    className={
                      isActive("Ventas")
                        ? "bg-[#BEF0BB]  py-[1vh] mb-[0vh]  hover:no-underline"
                        : " py-[1vh] mb-[0vh]  hover:no-underline"
                    }>
                    <SideNavTrigger
                      icon={
                        <img
                          src="/public/sidebar/Frame-2.png"
                          className="text-sideNav h-[3vh] w-[3vh]"
                        />
                      }
                      activeIcon={
                        <img
                          src="/public/sidebar/Frame-3.png"
                          className="text-sideNav h-[3vh] w-[3vh]"
                        />
                      }
                      isActive={isActive("Ventas")}
                      className="text-sideNav">
                      Ventas{" "}
                    </SideNavTrigger>
                  </AccordionTrigger>
                  <AccordionContent className="pl-[1.5vw]">
                    {canSeeAdvisors && (
                      <SidenavItem
                        icon={
                          <UserPlus
                            strokeWidth={1}
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        activeIcon={
                          <UserPlus
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/sales/advisors`}
                        IsChild={true}
                        className="text-sideNav">
                        Asesores
                      </SidenavItem>
                    )}
                    {canSeeProcedures && (
                      <SidenavItem
                        icon={
                          <FilePlus
                            strokeWidth={1}
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        activeIcon={
                          <FilePlus
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/sales/procedures`}
                        IsChild={true}
                        className="text-sideNav">
                        Trámites
                      </SidenavItem>
                    )}
                    {canSeePlans && (
                      <SidenavItem
                        icon={
                          <img
                            src="/public/sidebar/Frame-28.png"
                            className="h-auto w-auto"
                          />
                        }
                        activeIcon={
                          <img
                            src="/public/sidebar/Frame-29.png"
                            className="h-auto w-auto"
                          />
                        }
                        href={`/management/sales/plans`}
                        IsChild={true}
                        className="text-sideNav">
                        Planes
                      </SidenavItem>
                    )}
                    {canSeeDifferentials && (
                      <SidenavItem
                        icon={
                          <BarChart2
                            strokeWidth={1}
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        activeIcon={
                          <BarChart2
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/sales/differentials`}
                        IsChild={true}
                        className="text-sideNav">
                        Diferenciales
                      </SidenavItem>
                    )}
                    {canSeeComissions && (
                      <SidenavItem
                        icon={
                          <DollarSign
                            strokeWidth={1}
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        activeIcon={
                          <DollarSign
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/sales/comissions`}
                        IsChild={true}
                        className="text-sideNav">
                        Comisiones
                      </SidenavItem>
                    )}
                    {canSeeBonuses && (
                      <SidenavItem
                        icon={
                          <Percent
                            strokeWidth={1}
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        activeIcon={
                          <Percent
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/sales/bonuses`}
                        IsChild={true}
                        className="text-sideNav">
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
                        ? "bg-[#BEF0BB]  py-[1vh] mb-[0vh]  hover:no-underline"
                        : " py-[1vh] mb-[0vh]  hover:no-underline"
                    }>
                    <SideNavTrigger
                      icon={
                        <img
                          src="/public/sidebar/Frame-4.png"
                          className=" h-[3vh] w-[3vh]"
                        />
                      }
                      activeIcon={
                        <img
                          src="/public/sidebar/Frame-5.png"
                          className=" h-[3vh] w-[3vh]"
                        />
                      }
                      isActive={isActive("Clientes")}
                      className="text-sideNav">
                      Clientes
                    </SideNavTrigger>
                  </AccordionTrigger>{" "}
                  <AccordionContent className="pl-[1.5vw]">
                    {canSeeAffiliates && (
                      <SidenavItem
                        icon={
                          <UserRound
                            strokeWidth={1}
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        activeIcon={
                          <UserRound
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/client/affiliates`}
                        IsChild={true}
                        className="text-sideNav">
                        Afiliados
                      </SidenavItem>
                    )}
                    {canSeeHealthInsurances && (
                      <SidenavItem
                        icon={
                          <img
                            src="/public/sidebar/Frame-26.png"
                            className=" w-[2vw] h-auto"
                          />
                        }
                        activeIcon={
                          <img
                            src="/public/sidebar/Frame-27.png"
                            className=" w-[2vw] h-auto"
                          />
                        }
                        href={`/management/client/health_insurances`}
                        IsChild={true}
                        className="text-sideNav">
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
                        ? " bg-[#BEF0BB]  py-[1vh] mb-[0vh]  hover:no-underline"
                        : " py-[1vh] mb-[0vh] hover:no-underline"
                    }>
                    <SideNavTrigger className="text-sideNav">
                      Proveedores
                    </SideNavTrigger>
                  </AccordionTrigger>
                  <AccordionContent className="pl-[1.5vw]">
                    <SidenavItem
                      icon={<Bell strokeWidth={1} />}
                      activeIcon={<Bell strokeWidth={1} color="#6952EB" />}
                      href={`/management/suppliers/abm`}
                      IsChild={true}
                      className="text-sideNav">
                      ABM Proveedores
                    </SidenavItem>
                    <SidenavItem
                      icon={<Archive strokeWidth={1} />}
                      activeIcon={<Archive strokeWidth={1} color="#6952EB" />}
                      href={`/management/suppliers/comprobants-upload`}
                      IsChild={true}
                      className="text-sideNav">
                      Alta Comprobantes
                    </SidenavItem>
                    <SidenavItem
                      icon={<Folder strokeWidth={1} />}
                      activeIcon={<Folder strokeWidth={1} color="#6952EB" />}
                      href={`/management/suppliers/currentAcounts`}
                      IsChild={true}
                      className="text-sideNav">
                      Cuentas Corrientes de Proveedores
                    </SidenavItem>
                    <SidenavItem
                      icon={<Globe strokeWidth={1} />}
                      activeIcon={<Globe strokeWidth={1} color="#6952EB" />}
                      href={`/management/suppliers/due_dates`}
                      IsChild={true}
                      className="text-sideNav">
                      Agenda de vencimientos
                    </SidenavItem>
                    <SidenavItem
                      icon={<Heart strokeWidth={1} />}
                      activeIcon={<Heart strokeWidth={1} color="#6952EB" />}
                      href={`/management/suppliers/orders`}
                      IsChild={true}
                      className="text-sideNav">
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
                        ? " bg-[#BEF0BB]  py-[1vh] mb-[0vh]  hover:no-underline"
                        : "   py-[1vh] mb-[0vh]  hover:no-underline"
                    }>
                    <SideNavTrigger
                      icon={
                        <Files strokeWidth={1} className="w-[1.5vw] h-auto" />
                      }
                      activeIcon={
                        <Files
                          strokeWidth={1}
                          color="#6952EB"
                          className="w-[1.5vw] h-auto"
                        />
                      }
                      isActive={isActive("Documentos")}
                      className="text-sideNav">
                      Documentos
                    </SideNavTrigger>
                  </AccordionTrigger>
                  <AccordionContent className="pl-[1.5vw]">
                    {canSeeMasiveUpload && (
                      <SidenavItem
                        icon={
                          <CloudUpload
                            strokeWidth={1}
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        activeIcon={
                          <CloudUpload
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/documents/massive-upload`}
                        IsChild={true}
                        className="text-sideNav">
                        Carga Masiva
                      </SidenavItem>
                    )}
                    {canSeeRecUpload && (
                      <SidenavItem
                        icon={
                          <Cloud strokeWidth={1} className="w-[1.5vw] h-auto" />
                        }
                        activeIcon={
                          <Cloud
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/documents/rec-upload`}
                        IsChild={true}
                        className="text-sideNav">
                        Carga REC
                      </SidenavItem>
                    )}
                    {canSeeOutput && (
                      <SidenavItem
                        icon={
                          <CloudDownload
                            strokeWidth={1}
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        activeIcon={
                          <CloudDownload
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/documents/output`}
                        IsChild={true}
                        className="text-sideNav">
                        Archivos de salida
                      </SidenavItem>
                    )}
                    {canSeeResponse && (
                      <SidenavItem
                        icon={
                          <MessageCircle
                            strokeWidth={1}
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        activeIcon={
                          <MessageCircle
                            strokeWidth={1}
                            color="#6952EB"
                            className="w-[1.5vw] h-auto"
                          />
                        }
                        href={`/management/documents/response`}
                        IsChild={true}
                        className="text-sideNav">
                        Respuesta
                      </SidenavItem>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </>
        )}
        {canSeeAudit && (
          <>
            <div>
              <SidenavSeparator className="text-sideNav">
                Auditoría
              </SidenavSeparator>
            </div>

            <SidenavItem
              href={`/audit/administrative`}
              icon={<Clipboard className="w-[1.5vw] h-auto" />}
              activeIcon={
                <Clipboard color="#6952EB" className="w-[1.5vw] h-auto" />
              }>
              Administrativo
            </SidenavItem>
            <SidenavItem
              href={`/audit/medical`}
              icon={<Activity strokeWidth={1} className="w-[1.5vw] h-auto" />}
              activeIcon={
                <Activity
                  strokeWidth={1}
                  className="w-[1.5vw] h-auto"
                  color="#6952EB"
                />
              }>
              Médico
            </SidenavItem>
            <SidenavItem
              href={`/audit/telefonica`}
              icon={<Phone strokeWidth={1} className="w-[1.5vw] h-auto" />}
              activeIcon={
                <Phone
                  strokeWidth={1}
                  className="w-[1.5vw] h-auto"
                  color="#6952EB"
                />
              }>
              Telefónica
            </SidenavItem>
            <SidenavItem
              href={`/audit/benefits`}
              icon={<Gift strokeWidth={1} className="w-[1.5vw] h-auto" />}
              activeIcon={
                <Gift
                  strokeWidth={1}
                  className="w-[1.5vw] h-auto"
                  color="#6952EB"
                />
              }>
              Prestaciones
            </SidenavItem>
            <SidenavItem
              href={`/audit/fixed_eventual`}
              icon={<Calendar strokeWidth={1} className="w-[1.5vw] h-auto" />}
              activeIcon={
                <Calendar
                  strokeWidth={1}
                  className="w-[1.5vw] h-auto"
                  color="#6952EB"
                />
              }>
              Eventuales/Fijos
            </SidenavItem>
            <SidenavItem
              href={`/audit/operations`}
              icon={<Settings strokeWidth={1} className="w-[1.5vw] h-auto" />}
              activeIcon={
                <Settings
                  strokeWidth={1}
                  className="w-[1.5vw] h-auto"
                  color="#6952EB"
                />
              }>
              Operaciones
            </SidenavItem>
          </>
        )}
        {canSeeBilling && (
          <>
            <div>
              <SidenavSeparator className="text-sideNav">
                FACTURACIÓN
              </SidenavSeparator>
            </div>

            {canSeeManualIssuance && (
              <SidenavItem
                icon={
                  <img
                    src="/public/sidebar/Frame-6.png"
                    className="w-[2vw] h-auto"
                  />
                }
                activeIcon={
                  <img
                    src="/public/sidebar/Frame-7.png"
                    className="w-[2vw] h-auto"
                  />
                }
                href={`/billing/manual_issuance`}
                className="text-sideNav">
                Generar manual
              </SidenavItem>
            )}
            {canSeePreLiquidation && (
              <SidenavItem
                icon={
                  <img
                    src="/public/sidebar/Frame-8.png"
                    className="w-[2vw] h-auto"
                  />
                }
                activeIcon={
                  <img
                    src="/public/sidebar/Frame-9.png"
                    className="w-[2vw] h-auto"
                  />
                }
                href={`/billing/pre-liquidation`}
                className="text-sideNav">
                Pre-Liquidacion
              </SidenavItem>
            )}
            {canSeeLiquidation && (
              <SidenavItem
                icon={
                  <img
                    src="/public/sidebar/Frame-10.png"
                    className="w-[2vw] h-auto"
                  />
                }
                activeIcon={
                  <img
                    src="/public/sidebar/Frame-11.png"
                    className="w-[2vw] h-auto"
                  />
                }
                href={`/billing/liquidation`}
                className="text-sideNav">
                Liquidacion
              </SidenavItem>
            )}
            {canSeeInformation && (
              <SidenavItem
                icon={
                  <HelpCircle strokeWidth={1} className="w-[1.5vw] h-auto" />
                }
                activeIcon={
                  <HelpCircle
                    strokeWidth={1}
                    color="#6952EB"
                    className="w-[1.5vw] h-auto"
                  />
                }
                href={`/billing/information`}
                className="text-sideNav">
                Informacion
              </SidenavItem>
            )}
            {canSeeConsults && (
              <SidenavItem
                icon={<Search strokeWidth={1} className="w-[1.5vw] h-auto" />}
                activeIcon={
                  <Search
                    strokeWidth={1}
                    color="#6952EB"
                    className="w-[1.5vw] h-auto"
                  />
                }
                href={`/billing/consults`}
                className="text-sideNav">
                Consultas
              </SidenavItem>
            )}
          </>
        )}
        {canSeeTreasury && (
          <>
            <div>
              <SidenavSeparator className="text-sideNav">
                TESORERÍA
              </SidenavSeparator>
            </div>

            {canSeeCC && (
              <SidenavItem
                icon={<Database strokeWidth={1} className="w-[1.5vw] h-auto" />}
                activeIcon={
                  <Database
                    strokeWidth={1}
                    className="w-[1.5vw] h-auto"
                    color="#6952EB"
                  />
                }
                href={`/treasury/current_count`}>
                Cuenta Corriente
              </SidenavItem>
            )}
            {canSeeCollections && (
              <SidenavItem
                icon={<Hand strokeWidth={1} className="w-[1.5vw] h-auto" />}
                activeIcon={
                  <Hand
                    strokeWidth={1}
                    className="w-[1.5vw] h-auto"
                    color="#6952EB"
                  />
                }
                href={`/treasury/collection`}>
                Cobranzas
              </SidenavItem>
            )}
            {canSeePayments && (
              <SidenavItem
                icon={<Wallet strokeWidth={1} className="w-[1.5vw] h-auto" />}
                activeIcon={
                  <Wallet
                    strokeWidth={1}
                    className="w-[1.5vw] h-auto"
                    color="#6952EB"
                  />
                }
                href={`/treasury/payments`}>
                Pagos
              </SidenavItem>
            )}
          </>
        )}
      </Sidenav>
    </ScrollArea>
  );
}
