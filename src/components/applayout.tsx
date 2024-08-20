import { OrganizationSwitcher } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import { SidenavSheet } from "./sidenav-sheet";
import { Button } from "./ui/button";
import { checkRole } from "~/lib/utils/server/roles";
import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "~/trpc/server";
import { UserButton } from "./clerk/user-button";
import { CustomOrganizationSwitcher } from "./clerk/org-switcher";
export type AppLayoutProps = {
  children: React.ReactNode;
  title?: React.ReactNode;
  sidenav?: React.ReactNode;
  headerClass?: string;
  sidenavClass?: string;
};

export default async function AppLayout(props: AppLayoutProps) {
  const isAdmin = checkRole("admin");
  const company = await api.companies.get.query();
  return (
    <>
      <header
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={`fixed top-0 right-0 left-0 z-10 flex h-[70px] items-center border-b px-2 backdrop-blur-md md:px-4 ${props.headerClass}`}
      >
        <SidenavSheet
          trigger={
            <Button variant="ghost" className="md:hidden">
              <MenuIcon />
            </Button>
          }
          content={props.sidenav}
        />
        <div className="w-full">{props.title}</div>
        <div className="flex gap-6 px-2">
          {isAdmin && (
            <CustomOrganizationSwitcher companyName={company?.name} />
          )}
          <UserButton companyName={company?.name} />
        </div>
      </header>
      <aside
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        className={`fixed bottom-0 left-0 z-20 hidden max-h-full w-[250px] overflow-y-hidden border-r md:block ${props.sidenavClass}`}
      >
        {props.sidenav}
      </aside>
      <main className="relative mt-[70px] p-3 md:ml-[250px] md:p-10">
        {props.children}
      </main>
    </>
  );
}
