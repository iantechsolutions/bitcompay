import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { clerkClient } from "@clerk/nextjs/server";

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
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        username: z.string(),
        role: z.string(),
      })
    )
    .mutation(async ({ input }) => {}),
});
