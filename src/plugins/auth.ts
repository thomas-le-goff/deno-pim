import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyPlugin from "fastify-plugin";
import { fastifyJwt, SignOptions } from "@fastify/jwt";
import { fastifyAuth } from "@fastify/auth";
import { User, UserId } from "../data/user.store.ts";
import { promisify } from "node:util";

declare module "fastify" {
  interface FastifyInstance {
    jwtPolicy(
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void>;
    getCurrentUser(request: FastifyRequest): Promise<User>;
    verifyUserAndPassword(
      login: { username: string; password: string },
    ): Promise<User>;
    generateToken(
      user: User,
    ): Promise<string>;
  }
}

const jwtOptions: SignOptions = {
  notBefore: "",
  expiresIn: "5h",
};

type JwtPayload = {
  id: UserId;
  username: string;
};

// TODO: replace with @std/dotenv OR fastify/env
function getEnvOrThrow(key: string): string {
  const value = Deno.env.get(key);
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function extractTokenFromHeader(authorization_header: string): string {
  // headers can return string | string[], normalize to a single token
  return (Array.isArray(authorization_header)
    ? authorization_header[0]
    : authorization_header).replace(
      "Bearer ",
      "",
    );
}

function auth(app: FastifyInstance, _options: FastifyPluginOptions) {
  app.register(fastifyJwt, {
    secret: getEnvOrThrow("JWT_PRIVATE"),
  });

  app.register(fastifyAuth);

  app.decorate(
    "jwtPolicy",
    async function (
      this: FastifyInstance,
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> {
      const rawAuth = request.raw.headers["authorization"];
      if (!rawAuth) {
        reply.code(401).send({ message: "Unauthorized" });
        throw new Error("Unauthorized");
      }

      const token = extractTokenFromHeader(rawAuth);

      try {
        await (promisify(this.jwt.verify))(token);
      } catch (err) {
        reply.code(401).send({ message: "Unauthorized" });
        throw new Error("Unauthorized", { cause: err });
      }
    },
  );

  app.decorate(
    "getCurrentUser",
    async function (
      this: FastifyInstance,
      request: FastifyRequest,
    ): Promise<User> {
      const rawAuth = request.raw.headers["authorization"];
      if (!rawAuth) {
        throw new Error(
          "Cannot get bearer token, please ensure user is authenticated before using the following function.",
        );
      }

      const token = extractTokenFromHeader(rawAuth);

      let decodedToken: JwtPayload | null;
      try {
        decodedToken = this.jwt.decode<JwtPayload>(token);
      } catch (err) {
        throw new Error("Cannot get token informations.", { cause: err });
      }

      if (!decodedToken) {
        throw new Error("Cannot get token informations.");
      }

      const user = await this.userStore.findById(decodedToken?.id);

      if (user) {
        return user;
      } else {
        throw new Error(`User id=${decodedToken.id} doesn't exist anymore.`);
      }
    },
  );

  app.decorate(
    "verifyUserAndPassword",
    async function (
      this: FastifyInstance,
      // TODO: type unification with type from upper/lower layer
      login: { username: string; password: string },
    ): Promise<User> {
      const userStore = this.userStore;
      const user = await userStore.findByUsernameAndHash(
        login.username,
        login.password, //TODO: hash password
      );

      if (!user) {
        //TODO: i18n https://intlayer.org/fr/doc/environment/fastify
        throw new Error("Incorrect username or password");
      }

      return user;
    },
  );

  app.decorate(
    "generateToken",
    function (
      this: FastifyInstance,
      user: User,
    ): Promise<string> {
      return new Promise((resolve, reject) => {
        this.jwt.sign(
          {
            id: user.id,
            username: user.username,
          },
          jwtOptions,
          (e, token) => {
            if (e) {
              reject(e);
            } else {
              resolve(token);
            }
          },
        );
      });
    },
  );
}

export default fastifyPlugin(auth, {
  name: "internal-auth",
  dependencies: [
    "internal-database",
  ],
});
