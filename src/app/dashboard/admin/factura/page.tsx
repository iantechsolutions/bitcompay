"use server";
import AppLayout from "~/components/applayout";
import fs from "fs";
import Sidenav, { SidenavItem } from "~/components/sidenav";
import { LayoutDashboardIcon, Settings2Icon } from "lucide-react";
import { getServerAuthSession } from "~/server/auth";
import { Title } from "~/components/title";
import { FacturaDialog } from "./generarFactura";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import { List, ListTile } from "~/components/list";

function formatDate(date: Date | null) {
  if (date) {
    return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDay();
  } else {
    return "";
  }
}

export default async function Home() {
  const html = fs.readFileSync(
    "src/app/dashboard/admin/factura/bill.html",
    "utf8",
  );
  const products = await api.facturas.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Facturas</Title>
          <FacturaDialog receivedHtml={html}></FacturaDialog>
        </div>
        <List>
          {products.map((product) => {
            return (
              <ListTile
                key={product.id}
                leading={"Nro: " + product.nroFactura + ","}
                title={" Emitida el: " + formatDate(product.generated)}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
