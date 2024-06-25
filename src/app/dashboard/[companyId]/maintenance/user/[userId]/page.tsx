import { clerkClient } from "@clerk/nextjs/server";
import UserPage from "./user-page";
export default async function page(props: { params: { userId: string } }) {
  const user = await clerkClient.users.getUser(props.params.userId);
  if (!user) return <div>usuario no encontrado</div>;
}
