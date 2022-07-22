import { createRouter } from "./context";
import { string, z } from "zod";
import { TRPCError } from "@trpc/server";
import { ErrorCode } from "../../utils/auth";
const { Pool, Client } = require("pg");
import superjson from "superjson";
import * as trpc from "@trpc/server";
import {
  swarmpitClient,
  serviceObject,
  newServiceObject,
} from "../swarmpit/client";
import { randomString } from "../../utils/helpers";
const axios = require("axios");

export const newServiceInputObject = z.object({
  repository: z.string(),
  name: z.string(),
  branch: z.string(),
  servicePort: z.number(),
  database: z.string().nullish(),
});
export type newServiceInput = z.infer<typeof newServiceInputObject>;

const nextJSDefaults = {
  repository: {
    name: process.env.NEXTJS_DEPLOY_DOCKER_IMAGE as string,
    tag: "latest",
  },
  hosts: [],
  mounts: [
    {
      type: "volume",
      containerPath: "/root/.npm",
      host: "npmcache",
      readOnly: false,
      key: "55557e99-58ff-46a4-8743-9f7b91969b58",
      volumeOptions: {
        driver: {
          name: "local",
          options: [],
        },
      },
    },
  ],
  secrets: [],
  mode: "replicated",
  networks: [
    {
      networkName: "traefik-public",
    },
  ],
  ports: [],
  logdriver: {
    name: "json-file",
    opts: [],
  },
  replicas: 1,
  deployment: {
    autoredeploy: false,
    restartPolicy: {
      condition: "any",
      delay: 5,
      attempts: 0,
    },
    update: {
      parallelism: 1,
      delay: 0,
      order: "stop-first",
      failureAction: "pause",
    },
    rollback: {
      parallelism: 1,
      delay: 0,
      order: "stop-first",
      failureAction: "pause",
    },
    placement: [],
  },
  resources: {
    reservation: {
      cpu: 0,
      memory: 0,
    },
    limit: {
      cpu: 0,
      memory: 0,
    },
  },
  configs: [],
};

export const swarmpitRouter = createRouter()
  .query("test", {
    async resolve({ input, ctx }) {
      // Let's get the user
      const client: any = swarmpitClient();
      const response = await client.get("/api/me");
      return response.data;
    },
  })
  .query("services", {
    async resolve({ input, ctx }) {
      // Let's get the user
      const client: typeof axios = swarmpitClient();
      const response = await client.get("/api/services");
      return response.data as serviceObject[];
    },
  })
  .mutation("remove-service", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      // Let's get the user app
      const app = await ctx.prisma.userApp.findFirst({
        where: {
          id: input.id,
        },
      });
      if (!app) {
        return;
      }

      //Let's get the service from the swarmpit

      const client: typeof axios = swarmpitClient();
      const services = await client.get("/api/services");
      const service = services.data.find(
        (service: serviceObject) => service?.serviceName === app.appName
      );
      if (!service) {
        return;
      }
      const response = await client.delete(`/api/services/${service.id}`);
      return response.data;
    },
  })
  .mutation("create-new-service", {
    input: newServiceInputObject,
    async resolve({ input, ctx }) {
      const client: typeof axios = swarmpitClient();
      const { repository, name, branch, servicePort } = input;
      if (!ctx.session || !ctx.session.user) {
        return;
      }
      const userToken = await ctx.prisma.account.findFirst({
        where: {
          userId: ctx.session.id as string,
          provider: "github",
        },
      });
      if (!userToken) {
        return;
      }
      const variableObject = z
        .array(
          z.object({
            name: z.string(),
            value: z.string(),
            key: z.string().nullish(),
          })
        )
        .nullable();
      type variableObject = z.infer<typeof variableObject>;

      let addedVariables: variableObject = [];

      if (input.database) {
        const db = await ctx.prisma.userDatabase.findFirst({
          where: {
            id: input.database,
          },
          include: {
            databaseHost: true,
          },
        });
        if (db) {
          addedVariables = [
            ...addedVariables,
            {
              name: "DATABASE_URL",
              value:
                `DATABASE_URL=postgres://` +
                db.clientUsername +
                `:` +
                db.clientPassword +
                `@` +
                db.databaseHost.hostname +
                `/` +
                db.clientDatabaseName +
                `?sslaccept=strict`,
            },
          ];
        }
      }

      const appUrl = name + ".dev.nsouthern.com";
      const httpRepository = repository.replace(
        "git://",
        "https://" + userToken.access_token + "@"
      );

      const service: newServiceObject = {
        ...nextJSDefaults,
        labels: [
          {
            name: "traefik.http.routers." + name + "-https.tls.certresolver",
            value: "le",
          },
          {
            name: "traefik.http.routers." + name + "-https.entrypoints",
            value: "https",
          },
          {
            name: "traefik.http.routers." + name + "-http.rule",
            value: "Host(`" + appUrl + "`)",
          },
          {
            name: "traefik.http.routers." + name + "-http.middlewares",
            value: "https-redirect",
          },
          {
            name: "traefik.constraint-label",
            value: "traefik-public",
          },
          {
            name: "traefik.http.routers." + name + "-https.rule",
            value: "Host(`" + appUrl + "`)",
          },
          {
            name: "traefik.docker.network",
            value: "traefik-public",
          },
          {
            name: "traefik.enable",
            value: "true",
          },
          {
            name: "traefik.http.routers." + name + "-https.tls",
            value: "true",
          },
          {
            name: "traefik.http.routers." + name + "-http.entrypoints",
            value: "http",
          },
          {
            name: "traefik.http.services." + name + ".loadbalancer.server.port",
            value: "3000",
          },
        ],
        variables: [
          ...addedVariables,
          {
            name: "PROJECT_REPOSITORY_URL",
            value: httpRepository,
          },
          {
            name: "PROJECT_BRANCH",
            value: branch,
          },
          {
            name: "GITHUB_TOKEN",
            value: userToken.access_token as string,
          },
          {
            name: "NEXTAUTH_SECRET",
            value: randomString(32),
          },
          {
            name: "NEXTAUTH_URL",
            value: appUrl,
          },
        ],

        serviceName: name,
      };
      // Let's send the created service to swarmpit..
      const response = await client
        .post("/api/services", service)
        .catch((err: any) => {
          console.log(err);
        });
      console.log(response.data);
      return response.data;
    },
  });
