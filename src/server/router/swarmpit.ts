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
});
export type newServiceInput = z.infer<typeof newServiceInputObject>;

const nextJSDefaults = {
  repository: {
    name: "jeronica/nextjs-with-turbo",
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

      const appUrl = name + ".dev.nsouthern.com";
      const httpRepository = repository.replace("git://", "https://");

      const service: newServiceObject = {
        ...nextJSDefaults,
        labels: [
          {
            name: "traefik.http.routers." + name + "-https.tls.certresolver",
            value: "le",
            key: "a33295b9-29c2-4029-84ee-eab73c0389d5",
          },
          {
            name: "traefik.http.routers." + name + "-https.entrypoints",
            value: "https",
            key: "80ee8406-33b5-4929-bd90-b84ae383eebe",
          },
          {
            name: "traefik.http.routers." + name + "-http.rule",
            value: "Host(`" + appUrl + "`)",
            key: "3ace2a01-662c-4992-8efa-0dccd6a3ad7b",
          },
          {
            name: "traefik.http.routers." + name + "-http.middlewares",
            value: "https-redirect",
            key: "a9da756e-a0d4-440f-a28e-9877ac874ce4",
          },
          {
            name: "traefik.constraint-label",
            value: "traefik-public",
            key: "f4e20170-9238-43bf-ae8d-0677d357920b",
          },
          {
            name: "traefik.http.routers." + name + "-https.rule",
            value: "Host(`" + appUrl + "`)",
            key: "80eba456-a7d4-4dd2-9e57-41ee61084f47",
          },
          {
            name: "traefik.docker.network",
            value: "traefik-public",
            key: "1d2ecd04-55ed-4b6f-97e2-5a9d9820aa78",
          },
          {
            name: "traefik.enable",
            value: "true",
            key: "5d7637de-8ffa-48fd-aa77-268e6ad2fc72",
          },
          {
            name: "traefik.http.routers." + name + "-https.tls",
            value: "true",
            key: "c836ef11-a380-45d4-9989-1fbdca675158",
          },
          {
            name: "traefik.http.routers." + name + "-http.entrypoints",
            value: "http",
            key: "ba252b4d-b926-45b3-aa1d-ac8f3ccf13ea",
          },
          {
            name: "traefik.http.services." + name + ".loadbalancer.server.port",
            value: "3000",
            key: "b76e4e3d-9c8c-4c6b-aa07-9eca74a61d98",
          },
        ],
        variables: [
          {
            name: "PROJECT_REPOSITORY_URL",
            value: httpRepository,
            key: "65495ff5-629c-4a54-b98f-c5ce93b35d20",
          },
          {
            name: "PROJECT_BRANCH",
            value: branch,
            key: "1197c278-d761-4be0-bd1e-3b990baeb635",
          },
          {
            name: "GITHUB_TOKEN",
            value: userToken.access_token as string,
            key: "3330b3d4-8ebf-4638-b1de-453e3ae2f06b",
          },
          {
            name: "NEXTAUTH_SECRET",
            value: randomString(32),
            key: "2a09a963-ca07-417a-bf72-30f9df7664ed",
          },
          {
            name: "NEXTAUTH_URL",
            value: appUrl,
            key: "d4c3aa4f-cb97-4c37-b28d-ae018569f681",
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
    },
  });
