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
      className={`flex items-center px-2 pl-3 py-[1vh] mt-[1vh] mb-[1vh] font-thin text-[#838383] text-xs md:text-sm lg:text-base${props.className}`}
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
  const className = `flex w-fit gap-[0.3vw] px-2 py-2 items-center rounded-full max-w-60
  md:text-sm lg:text-base xl:text-lg xxl:text-xl w-full mr-2 ${
    isActive ? activeColor : ""
  } ${props.className}`;

  const content = (
    <>
      <div className="min-w-8 items-center justify-center p-1 w-fit ">
        {isActive ? props.activeIcon : props.icon}
      </div>
      <p
        className={`text-sideNav block w-full text-left  ${
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
      className={`flex items-center text-left md:text-sm lg:text-base xl:text-lg px-1 py-[1vh] font-thin ${
        props.className
      } ${props.isActive ? "text-[#6952EB] font-semibold" : ""}`}
    >
      <div className="px-[0.5vw]">
        {props.isActive ? props.activeIcon : props.icon}
      </div>
      {props.children}
    </li>
  );
}
