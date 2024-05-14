"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
export default function Sidenav(props: { children: React.ReactNode }) {
  return <ul>{props.children}</ul>;
}

export function SidenavSeparator(props: { children: React.ReactNode }) {
  const menu = {
    Administracion: "administration",
    "Gestión de documentos": "management",
    General: "General",
    Clientes: "clients",
    Proveedores: "providers",
  };
  const pathname = usePathname();
  let isActive = false;
  if (typeof props.children === "string") {
    isActive = pathname.includes(props.children.toLowerCase());
  }

  console.log(typeof props.children === "string");
  console.log("isActive is ", isActive);
  return (
    <li
      className={`${
        isActive ? "bg-[#1bdfb7] " : ""
      } flex items-center px-4 pt-3 text-sm font-medium`}
    >
      {props.children}
    </li>
  );
}

export function SidenavItem(props: {
  icon: React.ReactNode;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    props.href !== "/dashboard" ? pathname.includes(props.href!) : false;
  const className = `w-full flex gap-2 px-3 py-1 items-center
    active:bg-stone-200 dark:active:bg-stone-800`;
  const content = (
    <>
      <div className="items-center justify-center p-1">{props.icon}</div>
      <p className="text block w-full text-left font-medium ">
        {props.children}
      </p>
    </>
  );

  if (props.href) {
    return (
      <li className={`${isActive ? "bg-[#8FEFDC] " : ""} flex items-center`}>
        <Link href={props.href} className={className}>
          {content}
          {isActive && <div className="h-2 w-3 rounded-full bg-gray-500"></div>}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button className={className} onClick={props.onClick}>
        {content}
      </button>
    </li>
  );
}
