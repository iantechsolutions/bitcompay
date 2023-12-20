import { NavUserData } from "./nav-user-section";
import { nameInitials } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function UserAvatarCircle(props: { user: NavUserData }) {
    return <Avatar role="button">
        {props.user.image && <AvatarImage src={props.user.image} />}
        <AvatarFallback>{nameInitials(props.user.name ?? '')}</AvatarFallback>
    </Avatar>
}