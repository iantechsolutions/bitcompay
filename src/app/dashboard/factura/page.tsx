"use server";
import AppLayout from "~/components/applayout";
import Factura from "./factura";
import fs from "fs";
import Sidenav, { SidenavItem } from "~/components/sidenav";
import { LayoutDashboardIcon, Settings2Icon } from "lucide-react";
import { getServerAuthSession } from "~/server/auth";

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
      <Factura receivedHtml={html}></Factura>
    </AppLayout>
  );
}