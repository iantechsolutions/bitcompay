import Link from "next/link";

export default function Sidenav(props: { children: React.ReactNode }) {
    return <ul>
        {props.children}
    </ul>
}

export function SidenavSeparator(props: { children: React.ReactNode }) {
    return <li className="px-4 pt-3 text-sm font-medium">
        {props.children}
    </li>
}

export function SidenavItem(props: {
    icon: React.ReactNode;
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
}) {
    const className =`w-full flex gap-2 px-3 py-2 items-center
    hover:bg-stone-100 dark:hover:bg-stone-900
    active:bg-stone-200 dark:active:bg-stone-800`

    const content = <>
        <div className="p-1 items-center justify-center">
            {props.icon}
        </div>
        <p className="text font-medium block w-full text-left">
            {props.children}
        </p>
    </>

    if (props.href) {
        return <li>
            <Link href={props.href} className={className}>
                {content}
            </Link>
        </li>
    }

    return <li>
        <button className={className} onClick={props.onClick}>
            {content}
        </button>
    </li>
}