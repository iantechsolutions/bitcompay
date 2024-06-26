import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { checkRole } from "~/lib/utils/roles";

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
        const res = await clerkClient.users.updateUser(input.userId, {
          publicMetadata: { role: input.role },
          firstName: input.firstName ?? undefined,
          lastName: input.lastName ?? undefined,
          username: input.username ?? undefined,
        });
        return { res };
      } catch (e) {
        return { message: "Error updating user" };
      }
    }),
});
