import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { SidenavSheet } from "./sidenav-sheet";
import { UserButton } from "@clerk/nextjs";

export type AppLayoutProps = {
  children: React.ReactNode;
  title?: React.ReactNode;
  sidenav?: React.ReactNode;
  headerClass?: string;
  sidenavClass?: string;
};

export default function AppLayout(props: AppLayoutProps) {
  return (
    <div>
      <header
        className={
          " fixed left-0 right-0 top-0 z-10 flex h-[70px] items-center border-b px-2 backdrop-blur-md md:px-4 " +
          props.headerClass
        }
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
        <UserButton />
      </header>
      <aside
        className={
          "fixed bottom-0 left-0 z-20 hidden max-h-full w-[250px] overflow-y-auto border-r md:block " +
          props.sidenavClass
        }
      >
        {props.sidenav}
      </aside>
      <main className="relative mt-[70px] p-3 md:ml-[250px] md:p-10">
        {props.children}
      </main>
    </div>
  );
}
