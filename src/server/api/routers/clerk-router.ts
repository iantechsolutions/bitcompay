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
        entities: z
          .array(z.string().optional().nullable())
          .optional()
          .nullable(),
      })
    )
    .mutation(async ({ input }) => {
      if (!checkRole("admin")) {
        return { message: "Not Authorized" };
      }
      const validRoles = ["admin", "member", "unauthorized"];
      if (!validRoles.includes(input.role)) {
        return {
          message: "El rol asignado no es válido. Por favor, seleccione un rol",
        };
      }
      try {
        const res = await clerkClient.users.updateUser(input.userId, {
          publicMetadata: { role: input.role },
          firstName: input.firstName ?? "",
          lastName: input.lastName ?? "",
        });

        // Eliminar las membresías actuales
        const currentMemberships =
          await clerkClient.users.getOrganizationMembershipList({
            userId: input.userId,
          });
        const currentOrgIds = currentMemberships.data.map(
          (x) => x.organization.id
        );

        await Promise.all(
          currentOrgIds.map(async (orgId) => {
            await clerkClient.organizations.deleteOrganizationMembership({
              organizationId: orgId ?? "",
              userId: input.userId,
            });
          })
        );

        // Añadir nuevas entidades/organizaciones
        try {
          const res2 = input?.entities?.map(async (entityId) => {
            await clerkClient.organizations.createOrganizationInvitation({
              organizationId: entityId ?? "",
              inviterUserId: res.id,
              role: input.role,
              emailAddress: res.emailAddresses[0]?.emailAddress ?? "",
            });
          });
        } catch (error) {
          console.error("Error al crear la invitación:", error);
          return { message: "Error al invitar al usuario a la organización." };
        }

        console.log("userUpdated", res);
        return { res };
      } catch (e: any) {
        console.log("Error al actualizar el usuario: ", e);
        if (e.errors && e.errors.length > 0) {
          const firstError = e.errors[0];
          if (firstError.code === "username_exists") {
            return {
              message:
                "El nombre de usuario ya está registrado, por favor elija otro",
            };
          }
          if (firstError.code === "form_username_invalid_length") {
            return {
              message:
                "El nombre de usuario debe tener entre 4 y 64 caracteres",
            };
          }
          if (firstError.code === "form_username_needs_non_number_char") {
            return {
              message:
                "El nombre de usuario debe tener un caracter no numérico",
            };
          }
          return { message: firstError.longMessage };
        }
        return {
          message: "Error desconocido. Por favor contacte al Administrador",
        };
      }
    }),
  relatedOrgs: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(0).max(1023),
      })
    )
    .query(async ({ input }) => {
      if (!checkRole("admin")) {
        return { message: "Not Authorized" };
      }
      try {
        console.log("orgList");
        console.log(input);
        const res = await clerkClient.users.getOrganizationMembershipList({
          userId: input.userId,
        });
        const orgIds = res.data.map((x) => x.organization.id);
        console.log(res);
        console.log(res);
        return { orgIds };
      } catch (e: any) {
        console.log(e);
        if (e.errors && e.errors.length > 0) {
          if (e.errors[0].code === "username_exists") {
            return {
              message:
                "El nombre de usuario ya esta registrado, por favor elija otro",
            };
          }
          if (e.errors[0].code === "form_username_invalid_length") {
            return {
              message:
                "El nombre de usuario debe tener entre 4 y 64 caracteres",
            };
          }
          if (e.errors[0].code === "form_username_needs_non_number_char") {
            return {
              message:
                "El nombre de usuario debe tener un caracter no numerico",
            };
          }
          return { message: e.errors[0].longMessage };
        }
        return {
          message: "Error desconocido. Por favor contacte al Administrador",
        };
      }
    }),
});
