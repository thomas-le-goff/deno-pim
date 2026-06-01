import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import fastifyPlugin from "fastify-plugin";
import * as Pg from "pg";

type ProductParams = { id: string };

function routes(app: FastifyInstance, _options: FastifyPluginOptions) {
  app.get("/", () => {
    return { hello: "world" };
  });

  app.route<{ Params: ProductParams }>({
    method: "GET",
    url: "/products/:id",
    preHandler: app.auth([
      app.jwtPolicy,
    ]),
    handler: async (
      request: FastifyRequest<{ Params: ProductParams }>,
      reply: FastifyReply,
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
