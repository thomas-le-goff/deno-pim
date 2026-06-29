import { Type } from "@fastify/type-provider-typebox";
import type { FastifyPluginCallbackTypebox } from "@fastify/type-provider-typebox";

import fastifyPlugin from "fastify-plugin";

import { StatusCodes } from "http-status-codes";
import type { User } from "../../../data/user.store.ts";
import {
  LoginBodySchema,
  RefreshBodySchema,
} from "../../../schemas/auth.schema.ts";
import { InvalidCredentialsError } from "../../auth.ts";
import type { RefreshToken } from "../../../data/refresh-token.store.ts";

const baseSchema = {
  tags: ["Authentication"],
};

const TokenSchema = Type.Object({
  token: Type.String(),
  type: Type.String(),
  expires_in: Type.Optional(Type.Number()),
});

const routes: FastifyPluginCallbackTypebox = (app, _opts, done) => {
  app.route({
    method: "POST",
    url: "/auth/login",
    schema: {
      ...baseSchema,
      body: LoginBodySchema,
      response: {
        200: Type.Object({
          access_token: TokenSchema,
          refresh_token: TokenSchema,
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
        if (err instanceof InvalidCredentialsError) {
          return reply.code(StatusCodes.BAD_REQUEST).send({
            message: req.t("auth.invalid-credentials"),
          });
        }

        throw err;
      }

      return reply.code(StatusCodes.OK).send(
        await app.createLoginResponse(user),
      );
    },
  });

  app.route({
    method: "POST",
    url: "/auth/refresh",
    schema: {
      ...baseSchema,
      body: RefreshBodySchema,
      response: {
        200: Type.Object({
          access_token: TokenSchema,
          refresh_token: TokenSchema,
        }),
        404: Type.Object({
          message: Type.String(),
        }),
      },
    },
    handler: async (
      req,
      reply,
    ) => {
      const { refresh_token: value } = req.body;

      let refreshToken: RefreshToken | undefined = undefined;
      try {
        refreshToken = await app.verifyRefreshToken(value);
      } catch (err) {
        if (err instanceof InvalidCredentialsError) {
          return reply.code(StatusCodes.NOT_FOUND).send({
            message: req.t("auth.refresh-token-not-found"),
          });
        }

        throw err;
      }

      if (refreshToken) {
        const user = await app.userStore.findById(refreshToken.user_id);
        if (user) {
          return reply.code(StatusCodes.OK).send(
            await app.createLoginResponse(user),
          );
        }
      }

      return reply.code(StatusCodes.NOT_FOUND).send({
        message: req.t("auth.refresh-token-not-found"),
      });
    },
  });

  done();
};

export default fastifyPlugin(routes, {
  dependencies: [
    "internal-auth",
    "internal-i18n",
  ],
  encapsulate: true,
});
