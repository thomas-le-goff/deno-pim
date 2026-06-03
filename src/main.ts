import Fastify from "fastify";
import Swagger from "@fastify/swagger";
import SwaggerUI from "@fastify/swagger-ui";

import process from "node:process";

import auth from "./plugins/auth.ts";
import dbConnector from "./plugins/database.ts";

import productRoutes from "./plugins/routes/product.routes.ts";
import authRoutes from "./plugins/routes/auth.routes.ts";
import userRoutes from "./plugins/routes/user.routes.ts";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

const environment = "development"; // TODO: how to properly switch between production and development env?

const loggerConfiguration = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const app = Fastify({
  logger: loggerConfiguration[environment] ?? true,
}).withTypeProvider<TypeBoxTypeProvider>();

export type App = typeof app;

// TODO: api versionning in route
await app.register(Swagger, {
  openapi: {
    info: {
      title: "Deno PIM",
      version: "1.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  hideUntagged: true,
});

await app.register(SwaggerUI);

await app.register(dbConnector);
await app.register(auth);

//TODO: maybe add index.js in routes folder for routes registration (use fastify autload)
app.register(productRoutes);
app.register(authRoutes);
app.register(userRoutes);

const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
