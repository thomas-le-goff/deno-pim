import fastifyPlugin from "fastify-plugin";

import type { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    verifyAccess: typeof verifyAccess;
    isAdmin: typeof isAdmin;
  }
}

function verifyAccess(
  this: FastifyRequest,
  reply: FastifyReply,
  role: string,
): FastifyReply | void {
  if (!this.user.roles.includes(role)) {
    return reply.status(403).send({
      message: this.t("authorization.forbidden"),
    });
  }
}

function isAdmin(
  this: FastifyRequest,
  reply: FastifyReply,
): FastifyReply | void {
  return this.verifyAccess(reply, "admin");
}

export default fastifyPlugin(
  function (fastify) {
    fastify.decorateRequest("verifyAccess", verifyAccess);
    fastify.decorateRequest("isAdmin", isAdmin);
  },
  {
    name: "authorization",
    dependencies: ["internal-i18n"],
  },
);
