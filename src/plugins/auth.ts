import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyPlugin from "fastify-plugin";
import { fastifyJwt, SignOptions } from "@fastify/jwt";
import { fastifyAuth } from "@fastify/auth";
import { createFromPartialUser, User, UserId } from "../data/user.store.ts";
import warning from "process-warning";

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
    hashPassword(password: string): Promise<string>;
    generateToken(
      user: User,
    ): Promise<string>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: JwtPayload;
  }
}

const jwtOptions: SignOptions = {
  notBefore: "",
  expiresIn: "5h",
};

type JwtPayload = {
  id: UserId;
  username: string;
  roles: [string];
};

const clearPasswordWarning = warning.createWarning({
  name: "AuthClearPassword",
  code: "AUTH_CLEAR_PASSWORD",
  message:
    "password hashing is currently not implemented, password will be stored as clear text.",
});

// TODO: replace with @std/dotenv OR fastify/env
function getEnvOrThrow(key: string): string {
  const value = Deno.env.get(key);
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

//TODO: use FastifyPluginCallbackTypebox / FastifyPluginAsyncTypebox
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
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    },
  );

  app.decorate(
    "getCurrentUser",
    async function (
      this: FastifyInstance,
      request: FastifyRequest,
    ): Promise<User> {
      // TODO type checking and transformation if required
      return Promise.resolve(createFromPartialUser(request.user));
    },
  );

  app.decorate(
    "verifyUserAndPassword",
    async function (
      this: FastifyInstance,
      login: { username: string; password: string },
    ): Promise<User> {
      const userStore = this.userStore;
      const user = await userStore.findByUsernameAndHash(
        login.username,
        await this.hashPassword(login.password),
      );

      if (!user) {
        //TODO: i18n https://intlayer.org/fr/doc/environment/fastify
        throw new Error("Incorrect username or password");
      }

      return user;
    },
  );

  app.decorate(
    "hashPassword",
    function (password: string): Promise<string> {
      clearPasswordWarning();
      return Promise.resolve(password);
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
            roles: [user.role],
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
