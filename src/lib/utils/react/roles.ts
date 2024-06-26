import { useUser } from "@clerk/nextjs";
import { Roles } from "~/lib/types/globals";

export const checkRole = (role: Roles) => {
  const { user } = useUser();

  return user?.publicMetadata.role === role;
};
