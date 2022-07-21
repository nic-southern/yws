import { createRouter } from "./context";
import { string, z } from "zod";
import { TRPCError } from "@trpc/server";
import { ErrorCode } from "../../utils/auth";
const { Pool, Client } = require("pg");
import superjson from "superjson";
import * as trpc from "@trpc/server";
import { githubClient, githubRepoType } from "../github/client";
const axios = require("axios");

export const githubRouter = createRouter().query("get-repositories", {
  async resolve({ input, ctx }) {
    // Let's get the user
    const user = ctx.session;
    if (!user) {
      throw new TRPCError({
        message: ErrorCode.UserNotFound,
        code: "NOT_FOUND",
      });
    }
    // Get user's github token
    const userToken = await ctx.prisma.account.findFirst({
      where: {
        userId: user.id as string,
        provider: "github",
      },
    });
    const gitClient: typeof axios = githubClient(
      userToken?.access_token as string
    );
    const response = await gitClient.get("/user/repos");
    return response.data as githubRepoType[];
  },
});
