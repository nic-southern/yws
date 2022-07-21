import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ErrorCode } from "../../utils/auth";

export const databasesRouter = createRouter().query("getUserDatabases", {
  async resolve({ ctx }) {
    if (!ctx.session) {
      throw new TRPCError({
        message: ErrorCode.UserNotFound,
        code: "NOT_FOUND",
      });
    }
    return await ctx.prisma.userDatabase.findMany({
      where: {
        databaseOwnerId: ctx.session.id as string,
      },
      include: {
        databaseHost: true,
      },
    });
  },
});
