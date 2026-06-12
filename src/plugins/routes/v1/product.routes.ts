import * as Pg from "pg";
import { ProductParamsSchema } from "../../../schemas/product.schema.ts";
import { FastifyPluginCallbackTypebox } from "@fastify/type-provider-typebox";
import fastifyPlugin from "fastify-plugin";
import { StatusCodes } from "http-status-codes";

const baseSchema = {
  tags: ["Product"],
  security: [{ bearerAuth: [] }],
};

const routes: FastifyPluginCallbackTypebox = (app, _opts, done) => {
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
          return reply.code(StatusCodes.NOT_FOUND).send({
            message: request.t("product.not-found"),
          });
        }
        return reply.code(StatusCodes.OK).send(rows[0]);
      } finally {
        //TODO: take a look at @fastify/awilix
        client.release();
      }
    },
  });

  done();
};

export default fastifyPlugin(routes, {
  dependencies: ["internal-auth", "internal-i18n", "@fastify/postgres"],
  encapsulate: true,
});
