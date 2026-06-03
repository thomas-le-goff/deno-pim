import { Type } from "@fastify/type-provider-typebox";

export const IdSchema = Type.Integer({ minimum: 1 });

export const ClientErrorSchema = Type.Object({
  message: Type.String(),
});
