import fastify, { FastifyError } from "fastify";
import fastifyAutoLoad from "@fastify/autoload";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyEnv from "@fastify/env";

import process from "node:process";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { TypeBoxTypeProvider, Type, Static } from "@fastify/type-provider-typebox";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const environment = "development"; // TODO: how to properly switch between production and development env?

declare module "fastify" {
  interface FastifyInstance {
    config: Static<typeof configSchema>;
  }
}

const configSchema = Type.Object({
  PORT: Type.String({ default: "3000" }),
  JWT_PRIVATE: Type.String(),
  DB_CONNECTION_STRING: Type.String(),
});

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

const app = fastify({
  logger: loggerConfiguration[environment] ?? true,
}).withTypeProvider<TypeBoxTypeProvider>();

app.setErrorHandler((err: FastifyError, request, reply) => {
  app.log.error(
    {
      err,
      request: {
        method: request.method,
        url: request.url,
        query: request.query,
        params: request.params,
      },
    },
    "Unhandled error occurred",
  );

  reply.code(err.statusCode ?? 500);

  let message = "Internal Server Error";
  if (err.statusCode && err.statusCode < 500) {
    message = err.message;
  }

  return { message };
});

await app.register(fastifyEnv, {
  confKey: "config",
  schema: configSchema,
});

await app.register(fastifySwagger, {
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

await app.register(fastifySwaggerUI);

await app.register(fastifyAutoLoad, {
  dir: path.join(__dirname, "plugins"),
  forceESM: true,
  ignorePattern: /^.*(?:routes).ts$/,
});

await app.register(fastifyAutoLoad, {
  dir: path.join(__dirname, "plugins/routes"),
  forceESM: true,
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
