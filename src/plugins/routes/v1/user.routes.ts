import { FastifySchema } from "fastify";

import fastifyPlugin from "fastify-plugin";
import { MeResponseSchema } from "../../../schemas/user.schema.ts";
import { ClientErrorSchema } from "../../../schemas/common.schema.ts";
import { FastifyPluginCallbackTypebox } from "@fastify/type-provider-typebox";

const baseSchema: FastifySchema = {
  tags: ["User"],
  security: [{ bearerAuth: [] }],
};

const routes: FastifyPluginCallbackTypebox = (
  app,
  _opts,
  done,
) => {
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

  done();
};

export default fastifyPlugin(routes, {
  dependencies: ["internal-auth"],
  encapsulate: true,
});
