import { fastifyPlugin } from "fastify-plugin";

import { Buffer } from "node:buffer";
import { createHash, timingSafeEqual } from "node:crypto";

export function sha256Hash(value: string): Promise<string> {
  return Promise.resolve(createHash("sha256").update(value).digest("hex"));
}

export function compare(value: string, hash: string): Promise<boolean> {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = Buffer.from(hash, "hex");

  if (valueHash.length !== expectedHash.length) {
    return Promise.resolve(false);
  }

  return Promise.resolve(timingSafeEqual(valueHash, expectedHash));
}

const tokenHasher = {
  hash: sha256Hash,
  compare,
};

export default fastifyPlugin((fastify) => {
  fastify.decorate("tokenHasher", tokenHasher);
}, {
  name: "internal-token-hasher",
});
