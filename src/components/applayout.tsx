import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { SidenavSheet } from "./sidenav-sheet";
import NavUserSection, { NavUserData } from "./nav-user-section";

export type AppLayoutProps = {
    children: React.ReactNode
    title?: React.ReactNode
    sidenav?: React.ReactNode
    user?: NavUserData
}

export default function AppLayout(props: AppLayoutProps) {
    return (
        <div>
            <header className="h-[70px] flex items-center px-2 md:px-4 border-b backdrop-blur-md">
                <SidenavSheet
                    trigger={<Button variant="ghost" className="md:hidden"><MenuIcon /></Button>}
                    content={props.sidenav}
                />
                <div className="w-full">
                    {props.title}
                </div>
                {props.user && <NavUserSection user={props.user} />}
            </header>
            <aside className="fixed top-[70px] left-0 bottom-0 hidden w-[250px] md:block border-r overflow-y-auto max-h-full">
                {props.sidenav}
            </aside>
            <main className="flex md:ml-[250px] p-10">
                {props.children}
            </main>
        </div>
    )
}