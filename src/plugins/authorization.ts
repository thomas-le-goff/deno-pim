import fastifyPlugin from "fastify-plugin";

import { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  export interface FastifyRequest {
    verifyAccess: typeof verifyAccess;
    isAdmin: typeof isAdmin;
  }
}

function verifyAccess(this: FastifyRequest, reply: FastifyReply, role: string) {
  if (!this.user.roles.includes(role)) {
    reply.status(403).send({
      message: "You are not authorized to access this resource.",
    });
  }
}

function isAdmin(this: FastifyRequest, reply: FastifyReply) {
  this.verifyAccess(reply, "admin");
}

export default fastifyPlugin(
  function (fastify) {
    fastify.decorateRequest("verifyAccess", verifyAccess);
    fastify.decorateRequest("isAdmin", isAdmin);
  },
  { name: "authorization" },
);
