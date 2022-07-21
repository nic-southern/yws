// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { databasesRouter } from "./databases";
import { githubRouter } from "./github";
import { swarmpitRouter } from "./swarmpit";
import { appsRouter } from "./apps";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("auth.", authRouter)
  .merge("swarmpit.", swarmpitRouter)
  .merge("apps.", appsRouter)
  .merge("github.", githubRouter)
  .merge("databases.", databasesRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
