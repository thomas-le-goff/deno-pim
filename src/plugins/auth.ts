import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyPlugin from "fastify-plugin";
import { fastifyJwt } from "@fastify/jwt";
import { fastifyAuth } from "@fastify/auth";
import { createFromPartialUser, User, UserId } from "../data/user.store.ts";

declare module "fastify" {
  interface FastifyInstance {
    jwtPolicy: typeof jwtPolicy;
    getCurrentUser: typeof getCurrentUser;
    verifyUserAndPassword: typeof verifyUserAndPassword;
    hashPassword: typeof hashPassword;
    generateAccessToken: typeof generateAccessToken;
    generateTokenResponse: typeof generateTokenResponse;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: JwtPayload;
  }
}

const FAKE_PASSWORD_HASH =
  "597f3caeccb3b5060c3b9994556fbc84.31520ccfc27544cba4be68b3cdd521419ef5f965d8f2eeb0b7f78fe29ef7b845";

type JwtPayload = {
  id: UserId;
  username: string;
  roles: [string];
};

type AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

async function jwtPolicy(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
}

function getCurrentUser(
  this: FastifyInstance,
  request: FastifyRequest,
): Promise<User> {
  return Promise.resolve(createFromPartialUser(request.user));
}

async function verifyUserAndPassword(
  this: FastifyInstance,
  login: { username: string; password: string },
): Promise<User> {
  const userStore = this.userStore;
  const user = await userStore.findByUsername(
    login.username,
  );

  // We fake password checking if user isn't found to prevent leaking information to an attacker.
  const hashedPassword = user?.password || FAKE_PASSWORD_HASH;
  const invalidPassword = await this.passwordHasher.compare(
    login.password,
    hashedPassword,
  );

  if (
    !invalidPassword || !user
  ) {
    throw new InvalidCredentialsError();
  }

  return user;
}

function hashPassword(
  this: FastifyInstance,
  password: string,
): Promise<string> {
  return this.passwordHasher.hash(password);
}

function generateAccessToken(
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
      {
        expiresIn: this.config.ACCESS_TOKEN_EXPIRES_IN,
      },
      (e, token) => {
        if (e) {
          reject(e);
        } else {
          resolve(token);
        }
      },
    );
  });
}

async function generateTokenResponse(
  this: FastifyInstance,
  user_or_token: User | string,
): Promise<AccessTokenResponse> {
  const response = {
    token_type: "Bearer",
    expires_in: this.config.ACCESS_TOKEN_EXPIRES_IN,
  };

  if (typeof user_or_token != "string") {
    return {
      ...response,
      access_token: await this.generateAccessToken(user_or_token),
    };
  }

  return {
    ...response,
    access_token: user_or_token,
  };
}

export default fastifyPlugin(
  function (app: FastifyInstance, _options: FastifyPluginOptions) {
    app.register(fastifyJwt, {
      secret: app.config.ACCESS_TOKEN_PRIVATE,
    });

    app.register(fastifyAuth);

    app.decorate("jwtPolicy", jwtPolicy);
    app.decorate("getCurrentUser", getCurrentUser);
    app.decorate("verifyUserAndPassword", verifyUserAndPassword);
    app.decorate("hashPassword", hashPassword);
    app.decorate("generateAccessToken", generateAccessToken);
    app.decorate("generateTokenResponse", generateTokenResponse);
  },
  {
    name: "internal-auth",
    dependencies: [
      "internal-database",
      "internal-password-hasher",
    ],
  },
);
