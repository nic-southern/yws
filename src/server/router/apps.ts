import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ErrorCode } from "../../utils/auth";
import { newServiceInputObject } from "./swarmpit";

export const appsRouter = createRouter()
  .query("get-user-apps", {
    async resolve({ ctx }) {
      if (!ctx.session) {
        throw new TRPCError({
          message: ErrorCode.UserNotFound,
          code: "NOT_FOUND",
        });
      }
      return await ctx.prisma.userApp.findMany({
        where: {
          userId: ctx.session.id as string,
        },
      });
    },
  })
  .mutation("create-new-app", {
    input: newServiceInputObject.nullish(),
    async resolve({ input, ctx }) {
      // We should have the data, already validated with what we needed
      if (!ctx.session) {
        throw new TRPCError({
          message: ErrorCode.UserNotFound,
          code: "NOT_FOUND",
        });
      }
      if (!input) {
        throw new TRPCError({
          message: ErrorCode.InvalidInput,
          code: "BAD_REQUEST",
        });
      }

      await ctx.prisma.userApp.create({
        data: {
          appType: "nextjs",
          appName: input.name,
          appRepository: input.repository,
          appBranch: input.branch,
          servicePort: input.servicePort,
          userId: ctx.session.id as string,
        },
      });
    },
  })
  .mutation("delete-client-app", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      if (!ctx.session) {
        throw new TRPCError({
          message: ErrorCode.UserNotFound,
          code: "NOT_FOUND",
        });
      }
      await ctx.prisma.userApp.delete({
        where: {
          id: input.id,
        },
      });
      // Let's also delete the app from docker orchestration
    },
  });
