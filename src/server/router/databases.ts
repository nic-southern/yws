import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ErrorCode } from "../../utils/auth";
import { randomString } from "../../utils/helpers";
import {
  PostgresClient,
  PostgresClientInput,
  PostgresClientInputType,
} from "../postgres/client";

export const databasesRouter = createRouter()
  .query("get-user-databases", {
    input: z
      .object({
        hasConnections: z.boolean().nullish(),
      })
      .nullish(),
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
  })
  .mutation("create-user-database", {
    // using zod schema to validate and infer input values
    input: z.object({
      hostId: z.string(),
    }),
    async resolve({ input, ctx }) {
      // Here some login stuff would happen
      const hostDatabase = await ctx.prisma.databaseHost.findFirst({
        where: {
          id: input.hostId,
        },
      });
      if (!hostDatabase) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No database was found.",
        });
      }
      const connectObject = {
        user: hostDatabase.adminUser,
        host: hostDatabase.hostname,
        database: hostDatabase.adminDatabase,
        password: hostDatabase.adminPassword,
        port: 5432,
      };

      // Let's build a Postgres client
      const client = PostgresClient(PostgresClientInput.parse(connectObject));

      // Let's create a new user, and database
      const clientDatabase = await ctx.prisma.userDatabase.create({
        data: {
          databaseHostId: hostDatabase.id,
          databaseOwnerId: ctx?.session?.id as string,
          clientUsername: randomString(8),
          clientPassword: randomString(8),
          clientDatabaseName: randomString(8),
        },
      });

      // Now that we have a new client database config set up, let's send the request to the host database to create a new database
      const createDatabaseResponse = await client.query(
        `CREATE DATABASE "${clientDatabase.clientDatabaseName}"`
      );
      if (createDatabaseResponse.rowCount === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create database.",
        });
      }
      // Create the postgres user
      const createUserResponse = await client.query(
        `CREATE USER "${clientDatabase.clientUsername}" WITH PASSWORD '${clientDatabase.clientPassword}'`
      );
      if (createUserResponse.rowCount === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user.",
        });
      }
      // Grant the user access to the database
      const grantUserResponse = await client.query(
        `GRANT ALL PRIVILEGES ON DATABASE "${clientDatabase.clientDatabaseName}" TO "${clientDatabase.clientUsername}"`
      );
      if (grantUserResponse.rowCount === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to grant user access.",
        });
      }
      // Return the new client database
      return "Created!";
    },
  })
  .mutation("delete-user-database", {
    // using zod schema to validate and infer input values
    input: z.object({
      databaseId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const clientDatabase = await ctx.prisma.userDatabase.findFirst({
        where: {
          id: input.databaseId,
        },
        include: {
          databaseHost: true,
        },
      });
      if (!clientDatabase) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No database was found.",
        });
      }
      console.log("1");

      const connectObject = {
        user: clientDatabase.databaseHost.adminUser,
        host: clientDatabase.databaseHost.hostname,
        database: clientDatabase.databaseHost.adminDatabase,
        password: clientDatabase.databaseHost.adminPassword,
        port: 5432,
      };

      // Let's build a Postgres client
      const client = PostgresClient(PostgresClientInput.parse(connectObject));
      // Delete Database
      const deleteDatabaseResponse = await client.query(
        `drop database if exists "${clientDatabase.clientDatabaseName}";`
      );
      // Delete the user
      const deleteUserResponse = await client.query(
        `drop user if exists "${clientDatabase.clientUsername}";`
      );
      console.log("3");
      console.log("deleted");
      // Finally delete the client database from prisma
      await ctx.prisma.userDatabase.delete({
        where: {
          id: input.databaseId,
        },
      });
      console.log("finished");
      return "Deleted!";
    },
  });
