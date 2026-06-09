import { FastifySchema } from "fastify";

import fastifyPlugin from "fastify-plugin";
import {
  CreateUserBodySchema,
  MeResponseSchema,
  SearchUserQuerySchema,
  UnPaginatedUsersResponseSchema,
  UserParamsSchema,
  UserResponseSchema,
} from "../../../schemas/user.schema.ts";
import {
  ClientErrorSchema,
  EmptySchema,
} from "../../../schemas/common.schema.ts";
import { FastifyPluginCallbackTypebox } from "@fastify/type-provider-typebox";

import { StatusCodes } from "http-status-codes";
import { createFromPartialUser } from "../../../data/user.store.ts";

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
      return reply.code(StatusCodes.OK).send(
        await this.getCurrentUser(request),
      );
    },
  });

  app.route({
    method: "GET",
    url: "/users",
    schema: {
      ...baseSchema,
      response: {
        200: UnPaginatedUsersResponseSchema,
        401: ClientErrorSchema,
      },
      querystring: SearchUserQuerySchema,
    },
    preHandler: app.auth([
      app.jwtPolicy,
    ]),
    handler: async function (
      request,
      reply,
    ) {
      const users = await this.userStore.findBySearchQuery(request.query);
      return reply.code(StatusCodes.OK).send({
        count: users.length,
        result: users,
      });
    },
  });

  app.route({
    method: "GET",
    url: "/users/:id",
    schema: {
      ...baseSchema,
      params: UserParamsSchema,
      response: {
        200: UserResponseSchema,
        400: ClientErrorSchema,
        404: ClientErrorSchema,
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
      const { id } = request.params;

      // TODO do we have some kind of middleware that handle every server error and turn it into 500 (otherwiser do we need to create one or properly use try/catch)
      const user = await this.userStore.findById(id.toString());

      if (user == null) {
        return reply.code(StatusCodes.NOT_FOUND).send({
          message: "User not found",
        });
      }

      return reply.code(StatusCodes.OK).send(user);
    },
  });

  app.route({
    method: "POST",
    url: "/users",
    schema: {
      ...baseSchema,
      body: CreateUserBodySchema,
      response: {
        201: UserResponseSchema,
        400: ClientErrorSchema,
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
      request.isAdmin(reply);

      const { body } = request;
      const newUser = createFromPartialUser({
        ...body,
        password: await this.hashPassword(body.password),
      });

      const existingUser = await this.userStore.findByUsername(
        newUser.username,
      );

      if (existingUser) {
        reply.code(StatusCodes.BAD_REQUEST).send({
          message: "Username already taken.",
        });
      }

      const createdUser = await this.userStore.create(newUser);

      return reply.code(StatusCodes.CREATED).send(createdUser);
    },
  });

  app.route({
    method: "DELETE",
    url: "/users/:id",
    schema: {
      ...baseSchema,
      params: UserParamsSchema,
      response: {
        204: EmptySchema,
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
      await this.userStore.delete(request.params.id.toString());

      return reply.code(StatusCodes.NO_CONTENT).send();
    },
  });

  done();
};

export default fastifyPlugin(routes, {
  dependencies: ["internal-auth"],
  encapsulate: true,
});
