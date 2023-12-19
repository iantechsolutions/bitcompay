import { nameInitials } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"
import Link from "next/link";
import { SignOut } from "./sign-in-out-buttons";

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
                        <p className="font-semibold">{props.user.name}</p>
                    </li>
                    <li className="text-sm font-medium py-2 pb-4">
                        <Link href={'/account'}>{props.user.email}</Link>
                    </li>
                    <li className="text-sm font-medium">
                        <SignOut />
                    </li>
                </ul>
            </PopoverContent>
        </Popover>
    )
}
