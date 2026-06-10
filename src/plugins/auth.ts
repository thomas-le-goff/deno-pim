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
    jwtPolicy: typeof jwtPolicy;
    getCurrentUser: typeof getCurrentUser;
    verifyUserAndPassword: typeof verifyUserAndPassword;
    hashPassword: typeof hashPassword;
    generateToken: typeof generateToken;
    generateTokenResponse: typeof generateTokenResponse;
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

type JwtTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

const clearPasswordWarning = warning.createWarning({
  name: "AuthClearPassword",
  code: "AUTH_CLEAR_PASSWORD",
  message:
    "password hashing is currently not implemented, password will be stored as clear text.",
});

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
  // TODO type checking and transformation if required
  return Promise.resolve(createFromPartialUser(request.user));
}

async function verifyUserAndPassword(
  this: FastifyInstance,
  login: { username: string; password: string },
): Promise<User> {
  const userStore = this.userStore;
  const user = await userStore.findByUsernameAndHash(
    login.username,
    await this.hashPassword(login.password),
  );

  if (!user) {
    throw new Error("Incorrect username or password");
  }

  return user;
}

function hashPassword(password: string): Promise<string> {
  clearPasswordWarning();
  return Promise.resolve(password);
}

function generateToken(
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
}

async function generateTokenResponse(
  this: FastifyInstance,
  user_or_token: User | string,
): Promise<JwtTokenResponse> {
  const response = {
    token_type: "Bearer",
    expires_in: 3600,
  };

  if (typeof user_or_token != "string") {
    return {
      ...response,
      access_token: await this.generateToken(user_or_token),
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
      secret: app.config.JWT_PRIVATE,
    });

    app.register(fastifyAuth);

    app.decorate("jwtPolicy", jwtPolicy);
    app.decorate("getCurrentUser", getCurrentUser);
    app.decorate("verifyUserAndPassword", verifyUserAndPassword);
    app.decorate("hashPassword", hashPassword);
    app.decorate("generateToken", generateToken);
    app.decorate("generateTokenResponse", generateTokenResponse);
  },
  {
    name: "internal-auth",
    dependencies: [
      "internal-database",
    ],
  },
);
