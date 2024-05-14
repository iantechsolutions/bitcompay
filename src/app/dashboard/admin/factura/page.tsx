"use server";
import AppLayout from "~/components/applayout";
import fs from "fs";
import Sidenav, { SidenavItem } from "~/components/sidenav";
import { LayoutDashboardIcon, Settings2Icon } from "lucide-react";
import { getServerAuthSession } from "~/server/auth";
import { Title } from "~/components/title";
import { FacturaDialog } from "./generarFactura";
import LayoutContainer from "~/components/layout-container";

export default async function Home() {
  const session = await getServerAuthSession();
  const html = fs.readFileSync(
    "src/app/dashboard/admin/factura/bill.html",
    "utf8",
  );
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Facturas</Title>
          <FacturaDialog receivedHtml={html}></FacturaDialog>
        </div>
      </section>
    </LayoutContainer>
  );
}
