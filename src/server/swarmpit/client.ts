// src/server/db/client.ts
const axios = require("axios").default;
import { z } from "zod";

// Exports an axios client for github requests..
export const swarmpitClient = () => {
  const client = axios.create({
    baseURL: "https://swarmpit.nsouthern.com",
    headers: {
      Authorization: process.env.SWARMPIT_TOKEN as string,
    },
  });
  console.log("Swarmpit client created");
  return client;
};
export type swarmpitClient = typeof axios;

const serviceObject = z
  .object({
    id: z.string().nullable(),
    version: z.number().nullable(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    serviceName: z.string().nullable(),
    mode: z.string().nullable(),
    stack: z.null().nullable(),
    agent: z.null().nullable(),
    immutable: z.null().nullable(),
    links: z.array(z.unknown()),
    replicas: z.number().nullable(),
    state: z.string().nullable(),
    status: z
      .object({
        tasks: z.object({ running: z.number().nullable(), total: z.number() }),
        update: z.string().nullable(),
        message: z.string().nullable(),
      })
      .nullable(),
    ports: z
      .array(
        z
          .object({
            containerPort: z.number().nullable(),
            protocol: z.string().nullable(),
            mode: z.string().nullable(),
            hostPort: z.number().nullable(),
          })
          .nullable()
      )
      .nullable(),
    mounts: z.array(z.unknown().nullable()).nullable(),
    networks: z
      .array(
        z
          .object({
            labels: z.null().nullable(),
            ingress: z.boolean().nullable(),
            enableIPv6: z.boolean().nullable(),
            created: z.string().nullable(),
            scope: z.string().nullable(),
            internal: z.boolean().nullable(),
            id: z.string().nullable(),
            ipam: z.object({
              subnet: z.string().nullable(),
              gateway: z.string(),
            }),
            stack: z.null().nullable(),
            options: z.array(
              z.object({ name: z.string().nullable(), value: z.string() })
            ),
            networkName: z.string().nullable(),
            driver: z.string().nullable(),
            attachable: z.boolean().nullable(),
            serviceAliases: z.null().nullable(),
          })
          .nullable()
      )
      .nullable(),
    secrets: z.array(z.unknown().nullable()).nullable(),
    configs: z.array(z.unknown().nullable()).nullable(),
    hosts: z.array(z.unknown().nullable()).nullable(),
    variables: z
      .array(z.object({ name: z.string().nullable(), value: z.string() }))
      .nullable(),
    labels: z.array(z.unknown()).nullable(),
    containerLabels: z.array(z.unknown()).nullable(),
    command: z.null().nullable(),
    user: z.null().nullable(),
    dir: z.null().nullable(),
    tty: z.null().nullable(),
    healthcheck: z.null().nullable(),
    logdriver: z.object({
      name: z.string().nullable(),
      opts: z.array(z.unknown()),
    }),
    resources: z.object({
      reservation: z.object({ cpu: z.number().nullable(), memory: z.number() }),
      limit: z.object({ cpu: z.number().nullable(), memory: z.number() }),
    }),
    deployment: z.object({
      update: z.object({
        parallelism: z.number().nullable(),
        delay: z.number().nullable(),
        order: z.string().nullable(),
        failureAction: z.string().nullable(),
      }),
      forceUpdate: z.any(),
      restartPolicy: z.object({
        condition: z.string().nullable(),
        delay: z.number().nullable(),
        window: z.number().nullable(),
        attempts: z.number().nullable(),
      }),
      rollback: z.object({
        parallelism: z.number().nullable(),
        delay: z.number().nullable(),
        order: z.string().nullable(),
        failureAction: z.string().nullable(),
      }),
      rollbackAllowed: z.boolean().nullable(),
      autoredeploy: z.boolean().nullable(),
      placement: z.array(z.unknown()),
    }),
  })
  .nullable();

export type serviceObject = z.infer<typeof serviceObject>;

const serviceObjectRequiredInput = z.object({
  serviceName: z.string().nullable(),
});

export type serviceObjectInput = z.infer<typeof serviceObjectRequiredInput>;

const newServiceObject = z.object({
  repository: z.object({ name: z.string(), tag: z.string() }),
  serviceName: z.string(),
  mode: z.string(),
  replicas: z.number(),
  mounts: z.array(
    z.object({
      containerPath: z.string(),
      host: z.string(),
      type: z.string(),
      id: z.string(),
      volumeOptions: z.object({
        labels: z.null(),
        driver: z.object({ name: z.string(), options: z.null() }),
      }),
      readOnly: z.boolean(),
      stack: z.null(),
    })
  ),
  networks: z.array(
    z.object({
      networkName: z.string(),
    })
  ),
  variables: z.array(z.object({ name: z.string(), value: z.string() })),
  labels: z.array(z.object({ name: z.string(), value: z.any() })),
  logdriver: z.object({ name: z.string(), opts: z.array(z.unknown()) }),
  deployment: z.object({
    update: z.object({
      parallelism: z.number(),
      delay: z.number(),
      order: z.string(),
      failureAction: z.string(),
    }),
    forceUpdate: z.any(),
    restartPolicy: z.object({
      condition: z.string(),
      delay: z.number(),
      window: z.number().nullable(),
      attempts: z.number(),
    }),
    rollback: z.object({
      parallelism: z.number(),
      delay: z.number(),
      order: z.string(),
      failureAction: z.string(),
    }),
    rollbackAllowed: z.boolean(),
    autoredeploy: z.boolean(),
    placement: z.array(z.unknown()),
  }),
});

const newNewServiceObject = z.object({
  labels: z.array(
    z.object({ name: z.string(), value: z.string(), key: z.string() })
  ),
  repository: z.object({ name: z.string(), tag: z.string() }),
  hosts: z.array(z.unknown()),
  mounts: z.array(
    z.object({
      type: z.string(),
      containerPath: z.string(),
      host: z.string(),
      readOnly: z.boolean(),
      key: z.string(),
      volumeOptions: z.object({
        driver: z.object({ name: z.string(), options: z.array(z.unknown()) }),
      }),
    })
  ),
  secrets: z.array(z.unknown()),
  mode: z.string(),
  variables: z.array(
    z.object({ name: z.string(), value: z.string(), key: z.string() })
  ),
  networks: z.array(z.object({ networkName: z.string() })),
  ports: z.array(z.unknown()),
  logdriver: z.object({ name: z.string(), opts: z.array(z.unknown()) }),
  replicas: z.number(),
  deployment: z.object({
    autoredeploy: z.boolean(),
    restartPolicy: z.object({
      condition: z.string(),
      delay: z.number(),
      attempts: z.number(),
    }),
    update: z.object({
      parallelism: z.number(),
      delay: z.number(),
      order: z.string(),
      failureAction: z.string(),
    }),
    rollback: z.object({
      parallelism: z.number(),
      delay: z.number(),
      order: z.string(),
      failureAction: z.string(),
    }),
    placement: z.array(z.unknown()),
  }),
  serviceName: z.string(),
  resources: z.object({
    reservation: z.object({ cpu: z.number(), memory: z.number() }),
    limit: z.object({ cpu: z.number(), memory: z.number() }),
  }),
  configs: z.array(z.unknown()),
});

export type newServiceObject = z.infer<typeof newNewServiceObject>;
