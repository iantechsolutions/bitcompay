import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { checkRole } from "~/lib/utils/server/roles";

export const clerkRouter = createTRPCRouter({
  getUserbyId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const response = await clerkClient.users.getUser(input.id);
      return response;
    }),

  editUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(0).max(1023),
        role: z.string().min(0).max(1023),
        firstName: z.string().min(0).max(1023).optional().nullable(),
        lastName: z.string().min(0).max(1023).optional().nullable(),
        username: z.string().min(0).max(1023).optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      if (!checkRole("admin")) {
        return { message: "Not Authorized" };
      }
      try {
        console.log("userUpdate")
        console.log(input);
        const res = await clerkClient.users.updateUser(input.userId, {
          publicMetadata: { role: input.role },
          firstName: input.firstName ?? undefined,
          lastName: input.lastName ?? undefined,
          username: input.username ?? undefined,
        });
        console.log("userUpdated");
        console.log(res);
        return { res };
      } catch (e:any) {
        console.log(e);
        if(e.errors && e.errors.length > 0) {
          if(e.errors[0].code === "username_exists") {
            return { message: "El nombre de usuario ya esta registrado, por favor elija otro" };
          }
          if(e.errors[0].code === "form_username_invalid_length") {
            return { message: "El nombre de usuario debe tener entre 4 y 64 caracteres" };
          }
          if(e.errors[0].code === "form_username_needs_non_number_char") {
            return { message: "El nombre de usuario debe tener un caracter no numerico" };
          }
          return { message: e.errors[0].longMessage };
        }
        return {message: "Error desconocido. Por favor contacte al Administrador"};
      }
    }),
});
