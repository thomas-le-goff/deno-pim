import { Type } from "@fastify/type-provider-typebox";

export const LoginBodySchema = Type.Object({
  username: Type.String(),
  password: Type.String(),
});

export const RefreshBodySchema = Type.Object({
  refresh_token: Type.String(),
});
