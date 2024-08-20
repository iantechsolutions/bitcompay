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
      className={`flex items-center px-4 py-1 text-base font-thin ${props.className}`}
    >
      {props.children}
    </li>
  );
}

export function SidenavItem(props: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  href: string;
  className?: string;
  IsChild?: boolean;
  activeIcon?: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === props.href;
  const activeColor = props.IsChild ? "bg-[#ECFFCF]" : "bg-[#D9FF9C]";
  const className = `w-full flex gap-2 px-3 py-1 items-center rounded-full
     ${isActive ? activeColor : ""} ${props.className}`;
  const content = (
    <>
      <div className="items-center justify-center p-1">
        {isActive ? props.activeIcon : props.icon}
      </div>
      <p className="text block w-full text-left ">{props.children}</p>
    </>
  );

  if (props.href) {
    return (
      <li className={`flex items-center rounded-lg`}>
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
