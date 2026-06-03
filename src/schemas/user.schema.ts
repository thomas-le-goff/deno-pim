import { Type } from "@fastify/type-provider-typebox";

export const MeResponseSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
});
