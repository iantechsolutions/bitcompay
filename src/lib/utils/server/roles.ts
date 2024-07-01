import { useUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Roles } from "~/lib/types/globals";

export const checkRole = (role: Roles) => {
  const { sessionClaims } = auth();

  return sessionClaims?.metadata.role === role;
};
