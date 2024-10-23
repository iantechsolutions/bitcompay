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
      className={`flex items-center px-3 pl-4 py-2 mt-[1vh] mb-[1vh] font-thin text-[#838383] text-xs xl:text-sm ${props.className}`}
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

  const isActive =
    props.href === "/dashboard"
      ? pathname === "/dashboard"
      : props.href
      ? pathname.includes(props.href)
      : false;

  const activeColor = props.IsChild ? "bg-[#DEF5DD]" : "bg-[#BEF0BB]";
  const className = `flex gap-1 px-2 py-1 items-center rounded-full
  text-xs xl:text-sm ${
    isActive ? activeColor : ""
  } ${props.className}`;

  const content = (
    <>
      <div className="items-center justify-center p-1 w-fit ">
        {isActive ? props.activeIcon : props.icon}
      </div>
      <p
        className={`text-sideNav block w-[160px] xl:w-[180px] text-left pr-2 ${
          isActive ? "font-medium text-[#6952EB]" : ""
        }`}
      >
        {props.children}
      </p>
    </>
  );

  if (props.href) {
    return (
      <li className={`flex items-center rounded-lg py-[1vh]`}>
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
  activeIcon?: React.ReactNode;
  isActive?: Boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={`flex items-center text-left text-xs xl:text-sm px-1 font-thin ${
        props.className
      } ${props.isActive ? "text-[#6952EB] !font-medium" : ""}`}
    >
      <div className="ml-4 mr-2  w-4 xl:w-5 h-auto">
        {props.isActive ? props.activeIcon : props.icon}
      </div>
      {props.children}
    </li>
  );
}
