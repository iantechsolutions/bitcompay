"use client";
import { usePathname } from "next/navigation";
type SidebarTimeProps = {
  children: string;
};

const SidebarText: React.FC<SidebarTimeProps> = ({ children }) => {
  const pathname = usePathname();
  const sombreado = " shadow-2xl";
  return <span className="shadow-3xl inline-block">{children}</span>;
};

export default SidebarText;
