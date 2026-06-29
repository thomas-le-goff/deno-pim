import fastifyPlugin from "fastify-plugin";
import { randomBytes } from "node:crypto";

const REFRESH_TOKEN_LENGTH = 32;

declare module "fastify" {
  export interface FastifyInstance {
    tokenGenerator: typeof tokenGenerator;
  }
}

const tokenGenerator = {
  randomRefreshToken: randomRefreshToken,
};

function randomRefreshToken(): Promise<string> {
  return Promise.resolve(
    randomBytes(REFRESH_TOKEN_LENGTH).toString("base64url"),
  );
}

export default fastifyPlugin((fastify) => {
  fastify.decorate("tokenGenerator", tokenGenerator);
}, {
  name: "internal-token-generator",
});
