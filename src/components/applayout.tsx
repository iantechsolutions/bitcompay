import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import { SidenavSheet } from "./sidenav-sheet";
import { Button } from "./ui/button";
import { checkRole } from "~/lib/utils/server/roles";

export type AppLayoutProps = {
  children: React.ReactNode;
  title?: React.ReactNode;
  sidenav?: React.ReactNode;
  headerClass?: string;
  sidenavClass?: string;
};

export default function AppLayout(props: AppLayoutProps) {
  const isAdmin = checkRole("admin");
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
          {isAdmin && <OrganizationSwitcher hidePersonal={true} />}
          <UserButton />
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
