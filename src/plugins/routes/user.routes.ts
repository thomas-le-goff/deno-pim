import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { Type } from "@fastify/type-provider-typebox";

import fastifyPlugin from "fastify-plugin";

function routes(app: FastifyInstance, _options: FastifyPluginOptions) {
  app.route<Record<PropertyKey, never>>({
    method: "GET",
    url: "/me",
    schema: {
      response: {
        // Can we infer this from TS type?
        200: Type.Object({
          id: Type.String(),
          username: Type.String(),
        }),
        401: Type.Object({
          message: Type.String(),
        }),
      },
    },
    preHandler: app.auth([
      app.jwtPolicy,
    ]),
    handler: async function (
      this: FastifyInstance,
      request: FastifyRequest<Record<PropertyKey, never>>,
      reply: FastifyReply,
    ) {
      reply.code(200).send(await this.getCurrentUser(request));
    },
  });
}

export default fastifyPlugin(routes, {
  dependencies: ["internal-auth"],
  encapsulate: true,
});
