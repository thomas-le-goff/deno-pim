import fastifyAutoLoad from "@fastify/autoload";
import fastifyEnv from "@fastify/env";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastify from "fastify";
import type { FastifyError } from "fastify";

import { resolveLocale, translate } from "./localization/fluent.ts";

import path, { dirname } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Type } from "@fastify/type-provider-typebox";

import type {
  Static,
  TypeBoxTypeProvider,
} from "@fastify/type-provider-typebox";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  production: {
    transport: {
      target: "pino-opentelemetry-transport",
      options: {
        logRecordProcessorOptions: [
          {
            recordProcessorType: "simple",
            exporterOptions: {
              protocol: "grpc",
            },
          },
          {
            recordProcessorType: "simple",
            exporterOptions: { protocol: "console" },
          },
        ],
      },
    },
  },
  test: false,
};

const { defaultEnvironment, environment } = resolveNodeEnv(
  Object.keys(loggerConfiguration),
);

declare module "fastify" {
  interface FastifyInstance {
    config: Static<typeof configSchema>;
  }
}

const configSchema = Type.Object({
  APP_PORT: Type.String({ default: "3000" }),
  ACCESS_TOKEN_PRIVATE: Type.String(),
  ACCESS_TOKEN_EXPIRES_IN: Type.Number(),
  REFRESH_TOKEN_EXPIRES_IN: Type.Number(),
  DB_CONNECTION_STRING: Type.String(),
  NODE_ENV: Type.String({ default: defaultEnvironment }),
});

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

  const locale = resolveLocale(request.headers["accept-language"]);
  let message = translate(locale, "errors.internal-server-error");
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
    await app.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

function resolveNodeEnv(envs: string[]) {
  const defaultEnvironment = envs[0];
  const requestedEnvironment = process.env.NODE_ENV ?? defaultEnvironment;

  if (!(requestedEnvironment in loggerConfiguration)) {
    throw new Error(
      `NODE_ENV (${requestedEnvironment}) must be one of: ${envs.join(", ")}`,
    );
  }

  const environment = requestedEnvironment as keyof typeof loggerConfiguration;
  return { defaultEnvironment, environment };
}
