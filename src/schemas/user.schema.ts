import { Type } from "@fastify/type-provider-typebox";
import { IdSchema } from "./common.schema.ts";

export const UserResponseSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
  role: Type.String(),
});

export const MeResponseSchema = UserResponseSchema;

export const UserParamsSchema = Type.Object({
  id: IdSchema,
});

export const SearchUserQuerySchema = Type.Object({
  role: Type.Optional(Type.String()),
});

export const UnPaginatedUsersResponseSchema = Type.Object({
  count: Type.Integer(),
  result: Type.Array(UserResponseSchema),
});

export const CreateUserBodySchema = Type.Object({
  username: Type.String({ minLength: 1 }),
  role: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 8 }),
});
