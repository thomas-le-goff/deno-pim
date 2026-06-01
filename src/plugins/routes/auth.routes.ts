import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { Type } from "@fastify/type-provider-typebox";

import fastifyPlugin from "fastify-plugin";

import { User } from "../../data/user.store.ts";

type LoginBody = {
  username: string;
  password: string;
};

function routes(app: FastifyInstance, _options: FastifyPluginOptions) {
  app.route<{ Body: LoginBody }>({
    method: "POST",
    url: "/login",
    schema: {
      body: {
        type: "object",
        properties: {
          username: { type: "string" },
          password: { type: "string" },
        },
        required: ["username", "password"], // TODO: use properties from schema.body.properties
      },
      response: {
        200: Type.String(),
        400: Type.Object({
          message: Type.String(),
        }),
      },
    },
    handler: async (
      req: FastifyRequest<{ Body: LoginBody }>,
      reply: FastifyReply,
    ) => {
      let user: User;

      try {
        user = await app.verifyUserAndPassword(req.body);
      } catch (err) {
        reply.code(400).send({ message: err });
        return;
      }

      const token = await reply.jwtSign({
        id: user.id,
        username: user.username,
      });

      reply.header("authorization", `Bearer ${token}`).send();
    },
  });
}

export default fastifyPlugin(routes, {
  dependencies: [
    "internal-auth",
  ],
});
