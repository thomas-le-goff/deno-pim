import { FastifyPluginOptions, FastifySchema } from "fastify";

import fastifyPlugin from "fastify-plugin";
import { App } from "../../main.ts";
import { MeResponseSchema } from "../../schemas/user.schema.ts";
import { ClientErrorSchema } from "../../schemas/common.schema.ts";

const baseSchema: FastifySchema = {
  tags: ["User"],
  security: [{ bearerAuth: [] }],
};

function routes(app: App, _options: FastifyPluginOptions) {
  app.route({
    method: "GET",
    url: "/me",
    schema: {
      ...baseSchema,
      response: {
        200: MeResponseSchema,
        401: ClientErrorSchema,
      },
    },
    preHandler: app.auth([
      app.jwtPolicy,
    ]),
    handler: async function (
      request,
      reply,
    ) {
      reply.code(200).send(await this.getCurrentUser(request));
    },
  });
}

export default fastifyPlugin(routes, {
  dependencies: ["internal-auth"],
  encapsulate: true,
});
