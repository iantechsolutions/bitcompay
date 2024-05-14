import {
  Building2Icon,
  LayoutDashboardIcon,
  Settings2Icon,
} from "lucide-react";
import Link from "next/link";
import AppLayout from "~/components/applayout";
import { List, ListTile } from "~/components/list";
import Sidenav, { SidenavItem } from "~/components/sidenav";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function Home() {
  const session = await getServerAuthSession();

  const companies = await api.companies.list.query();

  return (
    <AppLayout
      title={<h1>BITCOMPAY</h1>}
      user={session?.user}
      sidenavClass="top-[70px]"
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
      <div className="flex justify-between">
        <Title>Ingresar como empresa</Title>
        <Button>Gestionar</Button>
      </div>
      <List>
        {companies.map((company) => {
          return (
            <ListTile
              key={company.id}
              href={`/dashboard/company/${company.id}/general/dashboard`}
              title={company.name}
              leading={<Building2Icon />}
            />
          );
        })}
      </List>
    </AppLayout>
  );
}
