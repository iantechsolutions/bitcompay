"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
interface SidenavProps {
  children: React.ReactNode;
  className?: string;
}

export default function Sidenav({ children, className }: SidenavProps) {
  return <ul className={className}>{children}</ul>;
}

export function SidenavSeparator(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={`flex items-center px-4 py-1 mt-3 mb-2 text-lg font-thin text-[#838383] ${props.className}`}
    >
      {props.children}
    </li>
  );
}

export function SidenavItem(props: {
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
  children: React.ReactNode;
  href?: string;
  className?: string;
  IsChild?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === props.href;
  const activeColor = props.IsChild ? "bg-[#DEF5DD]" : "bg-[#BEF0BB]";
  const className = `w-full flex gap-2 px-3 py-2 items-center rounded-full
     ${isActive ? activeColor : ""} ${props.className}`;
  const content = (
    <>
      <div className="items-center justify-center p-1 mr-2 ">
        {isActive ? props.activeIcon : props.icon}
      </div>
      <p
        className={`text block w-full text-left text-lg  ${
          isActive ? "font-medium text-[#6952EB]" : ""
        }`}
      >
        {props.children}
      </p>
    </>
  );

  if (props.href) {
    return (
      <li className={`flex items-center rounded-lg py-2`}>
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

export function SideNavTrigger(props: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={`flex items-center w-1/2 text-left px-4 py-1  text-lg font-thin ${props.className}`}
    >
      {props.icon}
      {props.children}
    </li>
  );
}
