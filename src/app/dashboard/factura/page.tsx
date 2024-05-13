"use server";
import AppLayout from "~/components/applayout";
import fs from "fs";
import Sidenav, { SidenavItem } from "~/components/sidenav";
import { LayoutDashboardIcon, Settings2Icon } from "lucide-react";
import { getServerAuthSession } from "~/server/auth";
import { Title } from "~/components/title";
import { FacturaDialog } from "./generarFactura";

export default async function Home() {
  const session = await getServerAuthSession();
  const html = fs.readFileSync("src/app/dashboard/factura/bill.html", "utf8");
  return (
    <AppLayout
      title={<h1>BITCOMPAY</h1>}
      user={session?.user}
      sidenav={
        <Sidenav>
          <SidenavItem icon={<Settings2Icon />} href="/dashboard/admin">
            Administración
          </SidenavItem>
          <SidenavItem
            icon={<LayoutDashboardIcon />}
            href="/dashboard/management/transactions"
          >
            Gestión bitcompay
          </SidenavItem>
        </Sidenav>
      }
    >
      <Title>Facturas</Title>
      <FacturaDialog receivedHtml={html}></FacturaDialog>
      {/* <Factura receivedHtml={html}></Factura> */}
    </AppLayout>
  );
}
