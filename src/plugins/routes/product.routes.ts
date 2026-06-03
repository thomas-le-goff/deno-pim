import { FastifyPluginOptions } from "fastify";

import fastifyPlugin from "fastify-plugin";
import * as Pg from "pg";
import { App } from "../../main.ts";
import { ProductParamsSchema } from "../../schemas/product.schema.ts";

const baseSchema = {
  tags: ["Product"],
};

function routes(app: App, _options: FastifyPluginOptions) {
  app.route({
    method: "GET",
    url: "/products/:id",
    preHandler: app.auth([
      app.jwtPolicy,
    ]),
    schema: {
      ...baseSchema,
      params: ProductParamsSchema,
    },
    handler: async (
      request,
      reply,
    ) => {
      const client: Pg.Client = await app.pg.main.connect();
      try {
        const { rows } = await client.query(
          'SELECT * FROM "product" WHERE "id"=$1 LIMIT 1',
          [request.params.id],
        );
        if (rows.length === 0) {
          return reply.code(404).send({ message: "Product not found" });
        }
        return rows[0];
      } finally {
        //TODO: is there a way to have "scoped" service like in .NET? (using exists in TS/JS)
        client.release();
      }
    },
  });
}

export default fastifyPlugin(routes, {
  dependencies: ["@fastify/postgres"],
  encapsulate: true,
});

// TODO NEXT => use plugin autoloader and provide API documentation using Swagger
