"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
export default function Sidenav(props: { children: React.ReactNode }) {
  return <ul>{props.children}</ul>;
}

export function SidenavSeparator(props: { children: React.ReactNode }) {
  return <li className="px-4 pt-3 text-sm font-medium">{props.children}</li>;
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
  const className = `w-full flex gap-2 px-3 py-2 items-center
    active:bg-stone-200 dark:active:bg-stone-800`;
  // hover:bg-stone-100 dark:hover:bg-stone-900
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
      <li className={`${isActive ? "bg-zinc-300 " : ""}`}>
        <Link href={props.href} className={className}>
          {content}
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
