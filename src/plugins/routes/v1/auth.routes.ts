import {
  FastifyPluginCallbackTypebox,
  Type,
} from "@fastify/type-provider-typebox";

import fastifyPlugin from "fastify-plugin";

import { User } from "../../../data/user.store.ts";
import { LoginBodySchema } from "../../../schemas/auth.schema.ts";

const baseSchema = {
  tags: ["Authentication"],
};

const routes: FastifyPluginCallbackTypebox = (app, _opts, done) => {
  app.route({
    method: "POST",
    url: "/login",
    schema: {
      ...baseSchema,
      body: LoginBodySchema,
      response: {
        200: Type.Object({
          access_token: Type.String(),
          token_type: Type.String({ default: "Bearer" }),
          expires_in: Type.Integer(),
        }),
        400: Type.Object({
          message: Type.String(),
        }),
      },
    },
    handler: async (
      req,
      reply,
    ) => {
      let user: User;

      try {
        user = await app.verifyUserAndPassword(req.body);
      } catch (err) {
        // TODO prevent 500 error to be catch and move into 400
        reply.code(400).send({ message: `${err}` });
        return;
      }

      const token = await app.generateToken(user);

      reply.code(200).send({
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": 3600, // TODO: how to properly retrieve this information from the internal-auth plugin?
      });
    },
  });

  done();
};

export default fastifyPlugin(routes, {
  dependencies: [
    "internal-auth",
  ],
  encapsulate: true,
});
