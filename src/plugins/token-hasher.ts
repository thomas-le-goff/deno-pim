import { fastifyPlugin } from "fastify-plugin";

import { createHash } from "node:crypto";

declare module "fastify" {
  export interface FastifyInstance {
    tokenHasher: typeof tokenHasher;
  }
}

export function sha256Hash(value: string): Promise<string> {
  return Promise.resolve(createHash("sha256").update(value).digest("hex"));
}

const tokenHasher = {
  deterministicHash: sha256Hash,
};

export default fastifyPlugin((fastify) => {
  fastify.decorate("tokenHasher", tokenHasher);
}, {
  name: "internal-token-hasher",
});
