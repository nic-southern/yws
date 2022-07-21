import { string, z } from "zod";
import { TRPCError } from "@trpc/server";
import { ErrorCode } from "../../utils/auth";
const { Pool, Client } = require("pg");
import superjson from "superjson";
import * as trpc from "@trpc/server";

export const PostgresClientInput = z.object({
  user: z.string(),
  host: z.string(),
  database: z.string(),
  password: z.string(),
  port: z.number(),
});

export type PostgresClientInputType = z.infer<typeof PostgresClientInput>;

export const PostgresClient = ({
  user,
  host,
  database,
  password,
  port,
}: PostgresClientInputType) => {
  const client = new Client({
    user: user,
    host: host,
    database: database,
    password: password,
    port: port,
  });
  client.connect();
  return client;
};
