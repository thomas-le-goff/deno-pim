import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyPlugin from "fastify-plugin";
import { fastifyJwt } from "@fastify/jwt";
import { fastifyAuth } from "@fastify/auth";
import { createFromPartialUser } from "../data/user.store.ts";
import type { User, UserId } from "../data/user.store.ts";
import type { RefreshToken } from "../data/refresh-token.store.ts";

declare module "fastify" {
  interface FastifyInstance {
    jwtPolicy: typeof jwtPolicy;
    getCurrentUser: typeof getCurrentUser;
    verifyUserAndPassword: typeof verifyUserAndPassword;
    verifyRefreshToken: typeof verifyRefreshToken;
    hashPassword: typeof hashPassword;
    createAccessToken: typeof createAccessToken;
    createRefreshToken: typeof createRefreshToken;
    createLoginResponse: typeof createLoginResponse;
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

type TokenResponse = {
  token: string;
  type: string;
  expires_in: number | undefined;
};

type LoginResponse = {
  access_token: TokenResponse;
  refresh_token: TokenResponse;
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

async function verifyRefreshToken(
  this: FastifyInstance,
  token: string,
): Promise<RefreshToken> {
  const refreshTokenStore = this.refreshTokenStore;
  const refreshToken = await refreshTokenStore.findByValue(
    await this.tokenHasher.deterministicHash(token),
  );

  if (
    !refreshToken
  ) {
    throw new InvalidCredentialsError();
  }

  // Invalidated refresh token so it cannot be reused
  await refreshTokenStore.delete(refreshToken.id);

  return refreshToken;
}

function hashPassword(
  this: FastifyInstance,
  password: string,
): Promise<string> {
  return this.passwordHasher.hash(password);
}

function createAccessToken(
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

async function createRefreshToken(
  this: FastifyInstance,
  user: User,
): Promise<string> {
  const refreshTokenValue: string = await this.tokenGenerator
    .randomRefreshToken();
  await this.refreshTokenStore.insert({
    id: "",
    user_id: user.id,
    value: await this.tokenHasher.deterministicHash(refreshTokenValue),
    created_at: undefined,
  });

  return refreshTokenValue;
}

async function createLoginResponse(
  this: FastifyInstance,
  user_or_tokens: User | [string, string],
): Promise<LoginResponse> {
  const access_token: Omit<TokenResponse, "token"> = {
    type: "Bearer",
    expires_in: this.config.ACCESS_TOKEN_EXPIRES_IN,
  };

  const refresh_token: Omit<TokenResponse, "token"> = {
    type: "Refresh",
    expires_in: this.config.REFRESH_TOKEN_EXPIRES_IN,
  };

  if (!Array.isArray(user_or_tokens)) {
    return {
      access_token: {
        ...access_token,
        token: await this.createAccessToken(user_or_tokens),
      },
      refresh_token: {
        ...refresh_token,
        token: await this.createRefreshToken(user_or_tokens),
      },
    };
  }

  return {
    access_token: { ...access_token, token: user_or_tokens[0] },
    refresh_token: { ...refresh_token, token: user_or_tokens[1] },
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
    app.decorate("verifyRefreshToken", verifyRefreshToken);
    app.decorate("hashPassword", hashPassword);
    app.decorate("createLoginResponse", createLoginResponse);

    app.decorate("createAccessToken", createAccessToken);
    app.decorate("createRefreshToken", createRefreshToken);
  },
  {
    name: "internal-auth",
    dependencies: [
      "internal-database",
      "internal-password-hasher",
    ],
  },
);
