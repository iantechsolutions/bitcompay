import { nameInitials } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"
import Link from "next/link";
import { SignOut } from "./sign-in-out-buttons";
import { Badge } from "./ui/badge";

export type NavUserData = {
    name?: string | null;
    image?: string | null;
    email?: string | null;
}

export default function NavUserSection(props: {
    user: NavUserData
}) {
    return <UserPopOver
        user={props.user}
        trigger={<Avatar role="button">
            {props.user.image && <AvatarImage src={props.user.image} />}
            <AvatarFallback>{nameInitials(props.user.name ?? '')}</AvatarFallback>
        </Avatar>}
    />
}


export function UserPopOver(props: { trigger: React.ReactNode, user: NavUserData }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {props.trigger}
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <ul>
                    <li>
                        <Link href={'/account'} className="font-semibold">{props.user.name}</Link>
                    </li>
                    <li className="text-xs font-medium">
                        <Link href={'/account'}>{props.user.email}</Link>
                    </li>
                    <li className="mb-3 mt-1">
                        <p><Badge variant="secondary">Administrador</Badge></p>
                    </li>
                    <li className="text-sm font-medium">
                        <SignOut />
                    </li>
                </ul>
            </PopoverContent>
        </Popover>
    )
}
